//  Semantic Analyzer

import { Variable, Function, standardLibrary, error } from "./core.js"

/**************************
 *  VALIDATION FUNCTIONS  *
 *************************/

function check(condition, message, entity) {
  if (!condition) error(message, entity)
}

function checkInLoop(context) {
  check(context.inLoop, "Break can only appear in a loop")
}

function checkInFunction(context) {
  check(context.inFunc, "Return can only appear in a function")
}

/***************************************
 *  ANALYSIS TAKES PLACE IN A CONTEXT  *
 **************************************/

class Context {
  constructor(parent = null, inLoop = false, inFunc = false) {
    this.parent = parent
    this.locals = new Map()
    this.inLoop = inLoop
    this.inFunc = inFunc
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
      // error(`${token.lexeme} was expected to be a ${expectedType.name}`, token)
      if (expectedType.name === "Function") {
        error(`Call of non-function`, token)
      }
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
    d.variable.value = new Variable(d.variable.lexeme, d.modifier.lexeme === "fix")
    this.add(d.variable.lexeme, d.variable.value)
  }
  FunctionDeclaration(d) {
    // Add the function to the context before analyzing the body, because
    // we want to allow functions to be recursive
    if (this.inLoop) {
      error("A function cannot appear inside a loop")
    }
    d.fun.value = new Function(d.fun.lexeme, d.params.length, true)
    this.add(d.fun.lexeme, d.fun.value)
    const newContext = new Context(this, this.inLoop, true)
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
      // error(`The identifier ${s.target.lexeme} is read only`, s.target)
      error(`Cannot assign to constant ${s.target.lexeme}`, s.target)
    }
  }

  WhileStatement(s) {
    this.analyze(s.test)
    const newContext = new Context(this, true, this.inFunc)
    newContext.analyze(s.body)
  }

  ForStatement(s) {
    this.analyze(s.collection)
    s.iterator = new Variable(s.iterator.lexeme, true)
    const newContext = new Context(this, true, this.inFunc)
    newContext.add(s.iterator.name, s.iterator)
    newContext.analyze(s.body)
  }

  IfStatement(s) {
    this.analyze(s.test)
    const newContext = new Context(this, this.inLoop, this.inFunc)
    newContext.analyze(s.consequent)
    if (s.alternate.constructor === Array) {
      const otherwiseContext = new Context(this, this.inLoop, this.inFunc)
      otherwiseContext.analyze(s.alternate)
    } else if (s.alternate) {
      // It's a trailing if-statement, so same context
      this.analyze(s.alternate)
    }
  }

  ShortIfStatement(s) {
    this.analyze(s.test)
    const newContext = new Context(this, this.inLoop, this.inFunc)
    newContext.analyze(s.consequent)
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
  LookupExpression(e) {
    this.analyze(e.collection)
    this.analyze(e.index)
  }
  Token(t) {
    // Shortcut: only handle ids that are variables, not functions, here.
    // We will handle the ids in function calls in the Call() handler. This
    // strategy only works here, but in more complex languages, we would do
    // proper type checking.

    if (t.category === "Id") t.value = this.get(t, Variable)
    if (t.category === "Num") t.value = Number(t.lexeme)
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
