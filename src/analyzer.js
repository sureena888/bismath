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

/**************************
 *  VALIDATION FUNCTIONS  *
 *************************/

function check(condition, message, entity) {
  if (!condition) error(message, entity)
}

// function checkNotReadOnly(e) {
//   const readOnly = e instanceof Token ? e.value.readOnly : e.readOnly
//   check(!readOnly, `Cannot assign to constant ${e?.lexeme ?? e.name}`, e)
// }

// function checkFieldsAllDistinct(fields) {
//   check(
//     new Set(fields.map((f) => f.name.lexeme)).size === fields.length,
//     "Fields must be distinct"
//   )
// }

function checkInLoop(context) {
  check(context.inLoop, "Break can only appear in a loop")
}

function checkInFunction(context) {
  check(context.function, "Return can only appear in a function")
}

/***************************************
 *  ANALYSIS TAKES PLACE IN A CONTEXT  *
 **************************************/

class Context {
  // constructor(parent = null) {
  //   this.parent = parent
  //   this.locals = new Map()
  // }
  constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    // if (this.locals.has(name)) {
    //   error(`The identifier ${name} has already been declared`)
    // }
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
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    error(`Identifier ${name} not declared`)
  }
  newChildContext(props) {
    return new Context({ ...this, parent: this, locals: new Map(), ...props })
  }

  analyze(node) {
    return this[node.constructor.name](node)
  }

  Program(p) {
    this.analyze(p.statements)
  }

  // VariableDeclaration(d) {
  //   // Analyze the initializer *before* adding the variable to the context,
  //   // because we don't want the variable to come into scope until after
  //   // the declaration. That is, "let x=x;" should be an error (unless x
  //   // was already defined in an outer scope.)
  //   this.analyze(d.initializer)
  //   d.variable.value = new Variable(d.variable.lexeme, false)
  //   this.add(d.variable.lexeme, d.variable.value)
  // }

  FunctionDeclaration(d) {
    // Add the function to the context before analyzing the body, because
    // we want to allow functions to be recursive
    d.fun.value = new Function(d.fun.lexeme, d.params)
    const childContext = this.newChildContext({ inLoop: false, function: d.fun.value })
    childContext.analyze(d.fun.value.params)
    // Add before analyzing the body to allow recursion
    this.add(d.fun.lexeme, d.fun.value)
    childContext.analyze(d.body)
  }

  Assignment(s) {
    this.analyze(s.source)
    if (!this.sees(s.target.lexeme)) {
      s.target.value = new Variable(s.target.lexeme, false)
      this.add(s.target.lexeme, s.target.value)
    }
    this.analyze(s.target)
    if (s.target.value.readOnly) {
      error(`The identifier ${s.target.lexeme} is read only`, s.target)
    }
  }

  WhileStatement(s) {
    this.analyze(s.test)
    this.newChildContext({ inLoop: true }).analyze(s.body)
  }

  ForStatement(s) {
    this.analyze(s.collection)
    s.iterator = new Variable(s.iterator.lexeme, true)
    const bodyContext = this.newChildContext({ inLoop: true })
    bodyContext.add(s.iterator.name, s.iterator)
    bodyContext.analyze(s.body)
  }

  PrintStatement(s) {
    this.analyze(s.argument)
  }

  ReturnStatement(s) {
    checkInFunction(this)
    this.analyze(s.argument)
  }

  BreakStatement(s) {
    checkInLoop(this)
  }

  IfStatment() {
    this.analyze(s.test)
    this.newChildContext().analyze(s.consequent)
    if (s.alternate.constructor === Array) {
      // It's a block of statements, make a new context
      this.newChildContext().analyze(s.alternate)
    } else if (s.alternate) {
      // It's a trailing if-statement, so same context
      this.analyze(s.alternate)
    }
  }

  ShortIfStatement(s) {
    this.analyze(s.test)
    this.newChildContext().analyze(s.consequent)
  }

  ExpressionStatement(s) {
    this.analyze(s.expression)
  }

  Call(c) {
    this.analyze(c.args)
    c.callee.value = this.get(c.callee, Function)
    const expectedParamCount = c.callee.value.paramCount
    if (c.args.length !== expectedParamCount) {
      error(`Expected ${expectedParamCount} arg(s), found ${c.args.length}`, c.callee)
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

  MatrixExpression(e) {
    this.analyze(e.elements)
  }

  VectorExpression(e) {
    this.analyze(e.elements)
  }

  LookupExpression(e) {
    this.analyze(e.collection)
    this.analyze(e.index)
  }

  Token(t) {
    // Shortcut: only handle ids that are variables, not functions, here.
    // We will handle the ids in function calls in the Call() handler. This
    // strategy only works here, but in more complex languages, we would do
    // proper type checking.
    // if (t.category === "Id") t.value = this.get(t, Variable)
    if (t.category === "Id") {
      t.value = this.lookup(t.lexeme)
    }
    // if (t.category === "Num") t.value = BigInt(t.lexeme)
    // if (t.category === "Float") t.value = Number(t.lexeme)
    if (t.category === "Num") t.value = Number(t.lexeme)
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
