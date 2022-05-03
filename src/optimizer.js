// OPTIMIZER
//
// This module exports a single function to perform machine-independent
// optimizations on the analyzed semantic graph.
//
// The only optimizations supported here are:
//
//   - assignments to self (x = x) turn into no-ops
//   - constant folding
//   - some strength reductions (+0, -0, *0, *1, etc.)
//   - turn references to built-ins true and false to be literals
//   - remove all disjuncts in || list after literal true
//   - remove all conjuncts in && list after literal false
//   - while-false becomes a no-op
//   - repeat-0 is a no-op
//   - for-loop over empty array is a no-op
//   - for-loop with low > high is a no-op
//   - if-true and if-false reduce to only the taken arm
//
// The optimizer also replaces token references with their actual values,
// since the original token line and column numbers are no longer needed.
// This simplifies code generation.

import * as core from "./core.js"

export default function optimize(node) {
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  VariableDeclaration(d) {
    d.variable = optimize(d.variable)
    d.initializer = optimize(d.initializer)
    return d
  },
  FunctionDeclaration(d) {
    d.fun = optimize(d.fun)
    d.params = optimize(d.params)
    if (d.body) d.body = optimize(d.body)
    return d
  },
  IfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    s.alternate = optimize(s.alternate)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate
    }
    return s
  },
  ShortIfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : []
    }
    return s
  },
  Assignment(s) {
    s.source = optimize(s.source)
    s.target = optimize(s.target)
    if (s.source === s.target) {
      return null
    }
    return s
  },
  WhileStatement(s) {
    s.test = optimize(s.test)
    if (s.test === false) {
      return []
    }
    s.body = optimize(s.body)
    return s
  },
  ForStatement(s) {
    s.iterator = optimize(s.iterator)
    s.collection = optimize(s.collection)
    s.body = optimize(s.body)
    return s
  },
  PrintStatement(s) {
    s.argument = optimize(s.argument)
    return s
  },
  Call(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    if (c.args.length === 1 && c.args[0].constructor === Number) {
      if (c.callee.name === "sqrt") return Math.sqrt(c.args[0])
      if (c.callee.name === "sin") return Math.sin(c.args[0])
      if (c.callee.name === "cos") return Math.cos(c.args[0])
      if (c.callee.name === "ln") return Math.log(c.args[0])
      if (c.callee.name === "exp") return Math.exp(c.args[0])
    }
    return c
  },
  Conditional(c) {
    c.test = optimize(c.test)
    c.consequent = optimize(c.consequent)
    c.alternate = optimize(c.alternate)
    if (c.test.constructor === Number || c.test.constructor === Boolean) {
      return c.test ? c.consequent : c.alternate
    }
    return c
  },
  BinaryExpression(e) {
    e.op = optimize(e.op)
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    if (e.left.constructor === Number) {
      if (e.right.constructor === Number) {
        if (e.op === "+") {
          return e.left + e.right
        } else if (e.op === "-") {
          return e.left - e.right
        } else if (e.op === "*") {
          return e.left * e.right
        } else if (e.op === "/") {
          return e.left / e.right
        } else if (e.op === "%") {
          return e.left % e.right
        } else if (e.op === "^" && !(e.left === 0 && e.right == 0)) {
          return e.left ** e.right
        }
      } else if (e.left === 0 && e.op === "+") {
        return e.right
      } else if (e.left === 1 && e.op === "*") {
        return e.right
      } else if (e.left === 0 && e.op === "-") {
        return new core.UnaryExpression("-", e.right)
      } else if (e.left === 0 && ["*", "/", "%"].includes(e.op)) {
        return 0
      } else if (e.op === "^" && e.left === 1) {
        return 1
      }
    } else if (e.right.constructor === Number) {
      if (["+", "-"].includes(e.op) && e.right === 0) {
        return e.left
      } else if (["*", "/"].includes(e.op) && e.right === 1) {
        return e.left
      } else if (e.op === "*" && e.right === 0) {
        return 0
      } else if (e.op === "^" && e.left !== 0 && e.right === 0) {
        return 1
      }
    }
    return e
  },
  UnaryExpression(e) {
    e.op = optimize(e.op)
    e.operand = optimize(e.operand)
    if (e.operand.constructor === Number) {
      if (e.op === "-") {
        return -e.operand
      }
    }
    return e
  },
  MatrixExpression(e) {
    e.elements = optimize(e.elements)
    return e
  },
  VectorExpressions(e) {
    e.elements = optimize(e.elements)
    return e
  },
  LookupExpressions(e) {
    e.collection = optimize(e.collection)
    e.index = optimize(e.index)
    return e
  },
  Function(f) {
    return f
  },
  Variable(v) {
    return v
  },
  Number(e) {
    return e
  },
  Boolean(e) {
    return e
  },
  String(e) {
    return e
  },
  Token(t) {
    // All tokens get optimized away and basically replace with either their
    // value (obtained by the analyzer for literals and ids) or simply with
    // lexeme (if a plain symbol like an operator)
    return t.value ?? t.lexeme
  },
  Array(a) {
    // Optimizing arrays involves flattening an removing nulls
    return a.flatMap(optimize)
  },
}
