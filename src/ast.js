import fs from "fs"
import ohm from "ohm-js"
import * as core from "./core.js"

const bismathGrammar = ohm.grammar(fs.readFileSync("src/bismath.ohm"))

const astBuilder = bismathGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new core.Program(body.ast())
  },
  Block(_open, statements, _close) {
    // return new core.Block(statements.ast())
    return statements.ast()
  },
  IfStmt_long(_left, test, _right, _arrow, consequent, _otherwise, alternate) {
    return new core.IfStatement(test.ast(), consequent.ast(), alternate.ast())
  },
  IfStmt_short(_left, test, _right, _arrow, consequent) {
    return new core.ShortIfStatement(test.ast(), consequent.ast())
  },
  MathStmt_vardec(modifier, variable, _eq, initializer, _semi) {
    return new core.VariableDeclaration(modifier.ast(), variable.ast(), initializer.ast())
  },
  MathStmt_assignment(id, _eq, expression, _semi) {
    return new core.Assignment(id.ast(), expression.ast())
  },
  MathStmt_print(_put, argument, _semi) {
    return new core.PrintStatement(argument.ast())
  },
  MathStmt_return(_output, argument, _semi) {
    return new core.ReturnStatement(argument.ast())
  },
  MathStmt_break(_break, _semi) {
    return new core.BreakStatement()
  },
  // MathStmt_simple(expression, _semi) {
  //   return new core.ExpressionStatement(expression.ast())
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
  Loop_for(_for, id, _in, collection, body) {
    return new core.ForStatement(id.ast(), collection.ast(), body.ast())
  },
  Loop_while(_while, test, body) {
    return new core.WhileStatement(test.ast(), body.ast())
  },
  Function(_function, id, _left, params, _right, block) {
    return new core.FunctionDeclaration(id.ast(), params.asIteration().ast(), block.ast())
  },
  Call(callee, _left, args, _right) {
    return new core.Call(callee.ast(), args.asIteration().ast())
  },
  // Params(identifiers) {
  //   return identifiers.asIteration().ast()
  // },
  // Args(expressions) {
  //   return expressions.asIteration().ast()
  // },
  Matrix(_left, args, _right) {
    return new core.MatrixExpression(args.asIteration().ast())
  },
  Vector(_left, args, _right) {
    return new core.VectorExpression(args.asIteration().ast())
  },
  Lookup(collection, _left, index, _right) {
    return new core.LookupExpression(collection.ast(), index.ast())
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
  strlit(_openQuote, _chars, _closeQuote) {
    return new core.Token("Str", this.source)
  },
  _terminal() {
    return new core.Token("Sym", this.source)
  },
  _iter(...children) {
    return children.map((child) => child.ast())
  },
})

export default function ast(sourceCode) {
  const match = bismathGrammar.match(sourceCode)
  if (!match.succeeded()) core.error(match.message)
  return astBuilder(match).ast()
}
