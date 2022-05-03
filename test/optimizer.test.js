import assert from "assert/strict"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

//Make some test cases easier to read
const x = new core.Variable("x", false)
const neg = (x) => new core.UnaryExpression("-", x)
const power = (x, y) => new core.BinaryExpression("^", x, y)
const cond = (x, y, z) => new core.Conditional(x, y, z)
const sqrt = core.standardLibrary.sqrt
const call = (f, args) => new core.Call(f, args)

function expression(e) {
  return analyze(ast(`set x=1; put ${e};`)).statements[1].argument
}

const tests = [
  ["folds +", expression("5 + 8"), 13],
  ["folds -", expression("5 - 8"), -3],
  ["folds *", expression("5 * 8"), 40],
  ["folds /", expression("5 / 8"), 0.625],
  ["folds %", expression("17 % 5"), 2],
  ["folds ^", expression("5 ^ 8"), 390625],
  ["optimizes +0", expression("x + 0"), x],
  ["optimizes -0", expression("x - 0"), x],
  ["optimizes *1", expression("x * 1"), x],
  ["optimizes /1", expression("x / 1"), x],
  ["optimizes *0", expression("x * 0"), 0],
  ["optimizes 0*", expression("0 * x"), 0],
  ["optimizes 0/", expression("0 / x"), 0],
  ["optimizes 0+", expression("0 + x"), x],
  ["optimizes 0-", expression("0 - x"), neg(x)],
  ["optimizes 1*", expression("1 * x"), x],
  ["folds negation", expression("- 8"), -8],
  ["optimizes 1^", expression("1 ^ x"), 1],
  ["optimizes ^0", expression("x ^ 0"), 1],
  ["optimizes sqrt", expression("sqrt(16)"), 4],
  ["optimizes sin", expression("sin(0)"), 0],
  ["optimizes cos", expression("cos(0)"), 1],
  ["optimizes exp", expression("exp(1)"), Math.E],
  ["optimizes ln", expression("ln(2)"), Math.LN2],
  ["optimizes deeply", expression("8 * (-5) + 2 ^ 3"), -32],
  ["optimizes arguments", expression("sqrt(20 + 61)"), 9],
  ["optimizes true conditionals", expression("1?3:5"), 3],
  ["optimizes false conditionals", expression("0?3:5"), 5],
  ["leaves nonoptimizable binaries alone", expression("x ^ 5"), power(x, 5)],
  ["leaves 0**0 alone", expression("0 ^ 0"), power(0, 0)],
  ["leaves nonoptimizable conditionals alone", expression("x?x:2"), cond(x, x, 2)],
  ["leaves nonoptimizable calls alone", expression("sqrt(x)"), call(sqrt, [x])],
  ["leaves nonoptimizable negations alone", expression("-x"), neg(x)],
  [
    "optimizes in function body",
    analyze(ast("function f() {output 1+1;}")),
    optimize(analyze(ast("function f() {put 2;}"))),
  ],
  [
    "removes x=x",
    analyze(ast("set x=1; x=x; put(x);")),
    optimize(analyze(ast("set x=1; put(x);"))),
  ],
  [
    "optimizes while test",
    analyze(ast("while sqrt(25) {}")),
    new core.Program([new core.WhileStatement(5, [])]),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
