import assert from "assert/strict"
// import fs from "fs"
// import ohm from "ohm-js"
import ast from "../src/ast.js"

const syntaxChecks = [
  ["all numeric literal forms", "put 8 * 89.123;"],
  ["complex expressions", "put(83 * ((((-((((13 / 21)))))))) + 1 - 0);"],
  ["all unary operators", "put (-3); put (!false);"],
  ["all binary operators", "put x && y || z * 1 / 2 ** 3 + 4 < 5;"],
  ["all arithmetic operators", "x = (!3) * 2 + 4 - (-7.3) * 8 ** 13 / 1;"],
  ["all relational operators", "x = 1<(2<=(3==(4!=(5 >= (6>7)))));"],
  ["all logical operators", "x = true && false || (!false);"],
  ["the conditional operator", "put x ? y : z;"],
  ["end of program inside comment", "put(0); // yay"],
  ["comments with no text are ok", "put(1);//\nput(0);//"],
  ["conditional statement", "(x != 0) -> { x = x-1;} otherwise { put x + 2;}"],
  ["Loops", "for val in vector {put val;}"],
  ["matrix and vector lookups", "put matrix[3][4]; f(argument)[1][2]; <1,2,3,4,5>[2];"],
]

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  ["a missing right operand", "put(5 -", /Line 1, col 10/],
  ["a non-operator", "put(7 * ((2 _ 3)", /Line 1, col 15/],
  ["an expression starting with a )", "x = );", /Line 1, col 5/],
  ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  ["an illegal statement on line 2", "put(5);\nx * 5;", /Line 2, col 3/],
  ["a statement starting with a )", "put(5);\n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
]

// describe("The grammar", () => {
//   const grammar = ohm.grammar(fs.readFileSync("grammar/bismath.ohm"))
//   for (const [scenario, source] of syntaxChecks) {
//     it(`properly specifies ${scenario}`, () => {
//       assert(grammar.match(source).succeeded())
//     })
//   }
//     for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
//       it(`does not permit ${scenario}`, () => {
//         const match = grammar.match(source)
//         assert(!match.succeeded())
//         assert(new RegExp(errorMessagePattern).test(match.message))
//       })
//     }
// })

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`recognizes ${scenario}`, () => {
      assert(ast(source))
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => ast(source), errorMessagePattern)
    })
  }
})
