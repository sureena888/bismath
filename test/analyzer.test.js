import assert from "assert"
import ast from "../src/ast.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

//need to add length for matrices and vectors
//variable needs to be defined before lookup expressions can take place
//able to assign variables to functions like below
//["assigned functions", "function f() {}\nset g = f;g = f;"]
//["call of assigned functions", "function f(x) {}\nset g=f;g(1);"]
//boolean for while loops and if statements
//non-boolean ternary conditional test
//Since bismath only has nums we need to check that an index is an integer at runtime
//lot of type checking needed during code generation
//["a variable used as function", "set x = 1; x(2);", /Expected "="/]
// ["non-boolean conditional test", "put(1?2:3);", /Expected a boolean/] this check should be at run time correct

const semanticChecks = [
  ["variable declarations", 'fix x = 3; set y = "hello world";'],
  ["increment and decrement", "set x = 10; x = x - 1; x = x + 1;"],
  ["return", "function f() {output;}"],
  ["return in nested if", "function f() {(true) -> {output ;}}"],
  ["return in nested while", "function f() {while true {output ;}}"],
  ["break in nested if", "while false {(true) -> {getout ;}}"],
  ["long if", "(true) -> {put(1);} otherwise (true) -> {put(3);}"],
  ["else if", "(true) -> {put(1);} otherwise (true) -> {put(0);} otherwise {put(3);}"],
  ["for over collection", "for i in [[1,2,3],[3,4,5],[6,7,8]] {put i;}"],
  ["conditionals with ternary op", "put(true ? 8 : 5.22);"],
  ["conditionals with strings", 'put(1<2 ? "x" : "y");'],
  ["||", "put((true||1<2)||(false||true));"],
  ["&&", "put((true&&1<2)&&false&&true);"],
  ["exponentiation", "put(9^3);"],
  ["relations", 'put(1<=2 && "x">"y" && 3.5<1.2);'],
  ["ok to == matrices", "put([1]==[5,8]);"],
  ["ok to != matrices", "put([1]!=[5,8]);"],
  ["arithmetic", "set x=1;put(2*3+5^((-3)/2-5%8));"],
  ["variables", "set x=[[[[1]]]]; put(x[0][0][0][0]+2);"],
  ["subscript exp", "set a=[1,2];put(a[0]);"],
  [
    "call of assigned function in expression",
    `function addThree(input) {output input+3;}
     set x = addThree(10);
     put x;`,
  ],
  ["matrix lookup", "set m = [2,3,4,5,6]; put m[2] == 4;"],
  ["built-in constants", "put(25.0 * π);"],
  ["built-in sin", "put(sin(π));"],
  ["built-in cos", "put(cos(93.999));"],
  ["built-in hypot", "put(hypot(-4.0, 3.00001));"],
]

const semanticErrors = [
  ["using undeclared identifiers", "put(x);", /Identifier x not declared/],
  ["undeclared id", "put(x);", /Identifier x not declared/],
  [
    "redeclared id",
    "set x = 1;set x = 1;",
    /Error: The identifier x has already been declared/,
  ],
  ["assign to const", "fix x = 1; x = 2;", /Cannot assign to constant x/],
  ["break outside loop", "getout;", /Break can only appear in a loop/],
  [
    "function inside loop",
    "while true {function f() {getout;}}",
    /A function cannot appear inside a loop/,
  ],
  ["return outside function", "output;", /Return can only appear in a function/],
  ["call of uncallable", "set x = 1;\nput(x());", /Call of non-function/],
  ["Too many args", "function f(x) {}\nfix a = f(1,2);", /Expected 1 arg\(s\), found 2/],
  ["Too few args", "function f(x) {}\nfix b = f();", /Expected 1 arg\(s\), found 0/],
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(ast(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(ast(source)), errorMessagePattern)
    })
  }
})
