import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const bismathGrammar = ohm.grammar(fs.readFileSync("src/bismath.ohm"))

const astBuilder = bismathGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new core.Program(body.ast())
  },
  Block(_left, body, _right) {
    return body.ast()
  },
  MathStmt_assignment(_declare, id, _eq, initializer, _endline) {
    return new core.VariableDeclaration(id.ast(), initializer.ast())
  },
  MathStmt_assign(id, _eq, expression, _semi) {
    return new core.Assignment(id.ast(), expression.ast())
  },
  MathStmt_print(_put, argument, _endline) {
    return new core.PrintStatement(argument.ast())
  },
  MathStmt_return(_output, argument, _endline) {
    return new core.PrintStatement(argument.ast())
  },
  MathStmt_break(_break, _semicolon) {
    return new core.BreakStatement()
  },
  Loop_for(_for, id, _in, collection, body) {
    return new core.ForStatement(id.ast(), collection.ast(), body.ast())
  },
  Loop_while(_while, test, body) {
    return new core.WhileStatement(test.ast(), body.ast())
  },
  IfStmt_long(_left, test, _right, _arrow, consequent, _otherwise, alternate) {
    return new core.IfStatement(test.ast(), consequent.ast(), alternate.ast())
  },
  IfStmt_short(_left, test, _right, _arrow, consequent) {
    return new core.ShortIfStatement(test.ast(), consequent.ast())
  },

  // Statement_fundec(_fun, id, _open, params, _close, _equals, body, _semicolon) {
  //   return new core.FunctionDeclaration(
  //     id.ast(),
  //     params.asIteration().ast(),
  //     body.ast()
  //   )
  // },
  // Statement_while(_while, test, body) {
  //   return new core.WhileStatement(test.ast(), body.ast())
  // },

  Exp_unary(op, operand) {
    return new core.UnaryExpression(op.ast(), operand.ast())
  },
  Exp_ternary(test, _questionMark, consequent, _colon, alternate) {
    return new core.Conditional(test.ast(), consequent.ast(), alternate.ast())
  },
  Exp1_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp2_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp3_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp4_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp5_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp6_binary(left, op, right) {
    return new core.BinaryExpression(op.ast(), left.ast(), right.ast())
  },
  Exp7_parens(_open, expression, _close) {
    return expression.ast()
  },

  Call(callee, _left, args, _right) {
    return new core.Call(callee.ast(), args.asIteration().ast())
  },
  id(_first, _rest) {
    return new core.Token("Id", this.source)
  },
  true(_) {
    return new core.Token("Bool", this.source)
  },
  false(_) {
    return new core.Token("Bool", this.source)
  },
  num(_whole, _point, _fraction, _e, _sign, _exponent) {
    return new core.Token("Num", this.source)
  },
  float(_whole, _point, _fraction, _e, _sign, _exponent) {
    return new core.Token("Float", this.source)
  },
  stringlit(_openQuote, _chars, _closeQuote) {
    return new core.Token("Str", this.source)
  },
  // _terminal() {
  //   return new core.Token("Sym", this.source)
  // },
  _iter(...children) {
    return children.map((child) => child.ast())
  },
})

export default function ast(sourceCode) {
  const match = bismathGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}
