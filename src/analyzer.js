//  Semantic Analyzer
//
// Analyzes the AST by looking for semantic errors and resolving references.
//
// Semantic analysis is done with the help of a context object, which roughly
// corresponds to lexical scopes in Bella. As Bella features static, nested
// scopes, each context contains not only a mapping of locally declared
// identifiers to their entities, but also a pointer to the static parent
// context. The root context, which contains the pre-declared identifiers and
// any globals, has a parent of null.

import { Variable, Function, standardLibrary, error } from "./core.js"

/*
 * Type Checking:
 */
Object.assign(Type.prototype, {
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this == target
  },
  // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
  // this is only when two types are equivalent; however, for other kinds
  // of types there may be special rules. For example, in a language with
  // supertypes and subtypes, an object of a subtype would be assignable
  // to a variable constrained to a supertype.
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  },
})

Object.assign(ArrayType.prototype, {
  isEquivalentTo(target) {
    // [T] equivalent to [U] only when T is equivalent to U.
    return (
      target.constructor === ArrayType &&
      this.baseType.isEquivalentTo(target.baseType)
    )
  },
  isAssignableTo(target) {
    // Arrays are INVARIANT in Carlos!
    return this.isEquivalentTo(target)
  },
})



Object.assign(FunctionType.prototype, {
  isEquivalentTo(target) {
    return (
      target.constructor === FunctionType &&
      this.returnType.isEquivalentTo(target.returnType) &&
      this.paramTypes.length === target.paramTypes.length &&
      this.paramTypes.every((t, i) => target.paramTypes[i].isEquivalentTo(t))
    )
  },
  isAssignableTo(target) {
    // Functions are covariant on return types, contravariant on parameters.
    return (
      target.constructor === FunctionType &&
      this.returnType.isAssignableTo(target.returnType) &&
      this.paramTypes.length === target.paramTypes.length &&
      this.paramTypes.every((t, i) => target.paramTypes[i].isAssignableTo(t))
    )
  },
})

/*
 * Analysis:
 */
class Context {
  constructor(parent = null) {
    this.parent = parent
    this.locals = new Map()
  }

  add(name, entity) {
    if (this.locals.has(name)) {
      error(`The identifier ${name} has already been declared`)
    }
    this.locals.set(name, entity)
    return entity
  }

  get(token, expectedType) {
    let entity
    for (let context = this; context; context = context.parent) {
      entity = context.locals.get(token.lexeme)
      if (entity) break
    }
    if (!entity) error(`Identifier ${token.lexeme} not declared`, token)
    if (entity.constructor !== expectedType) {
      error(`${token.lexeme} was expected to be a ${expectedType.name}`, token)
    }
    return entity
  }

  analyze(node) {
    return this[node.constructor.name](node)
  }

  Program(p) {
    this.analyze(p.statements)
  }

  VariableDeclaration(d) {
    // Analyze the initializer *before* adding the variable to the context,
    // because we don't want the variable to come into scope until after
    // the declaration. That is, "let x=x;" should be an error (unless x
    // was already defined in an outer scope.)
    this.analyze(d.initializer)
    d.variable.value = new Variable(d.variable.lexeme, false)
    this.add(d.variable.lexeme, d.variable.value)
  }

  FunctionDeclaration(d) {
    // Add the function to the context before analyzing the body, because
    // we want to allow functions to be recursive
    d.fun.value = new Function(d.fun.lexeme, d.params.length, true)
    this.add(d.fun.lexeme, d.fun.value)
    const newContext = new Context(this)
    for (const p of d.params) {
      let variable = new Variable(p.lexeme, true)
      newContext.add(p.lexeme, variable)
      p.value = variable
    }
    newContext.analyze(d.body)
  }

  Assignment(s) {
    this.analyze(s.source)
    this.analyze(s.target)
    if (s.target.value.readOnly) {
      error(`The identifier ${s.target.lexeme} is read only`, s.target)
    }
  }

  WhileStatement(s) {
    this.analyze(s.test)
    this.analyze(s.body)
  }

  PrintStatement(s) {
    this.analyze(s.argument)
  }

  Call(c) {
    this.analyze(c.args)
    c.callee.value = this.get(c.callee, Function)
    const expectedParamCount = c.callee.value.paramCount
    if (c.args.length !== expectedParamCount) {
      error(
        `Expected ${expectedParamCount} arg(s), found ${c.args.length}`,
        c.callee
      )
    }
  }

  Conditional(c) {
    this.analyze(c.test)
    this.analyze(c.consequent)
    this.analyze(c.alternate)
  }

  BinaryExpression(e) {
    this.analyze(e.left)
    this.analyze(e.right)
  }

  UnaryExpression(e) {
    this.analyze(e.operand)
  }

  Token(t) {
    // Shortcut: only handle ids that are variables, not functions, here.
    // We will handle the ids in function calls in the Call() handler. This
    // strategy only works here, but in more complex languages, we would do
    // proper type checking.
    if (t.category === "Id") t.value = this.get(t, Variable)
    if (t.category === "Num") t.value = BigInt(t.lexeme)
    if (t.category === "Float") t.value = Number(t.lexeme)
    if (t.category === "Str") t.value = t.lexeme
    if (t.category === "Bool") t.value = t.lexeme === "true"
  }

  Array(a) {
    a.forEach((item) => this.analyze(item))
  }
}

export default function analyze(programNode) {
  const initialContext = new Context()
  for (const [name, entity] of Object.entries(standardLibrary)) {
    initialContext.add(name, entity)
  }
  initialContext.analyze(programNode)
  return programNode
}
