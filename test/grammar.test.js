import assert from "assert/strict"
import fs from "fs"
import ohm from "ohm-js"

// prettier-ignore
const syntaxChecks = [
  ["simplest syntactically correct program", "break;"],
  ["multiple statements", "print(1); break;\nint32 x = 5; return; \nreturn;"],
  ["variable declarations", "float a = 1.234; int b = 97; float32 c = 9432.2345; int64 d = 45;"],
  ["Array declarations", "[int32] a1 = [1, 5, 24,5,3]; [bool] a2 = [true,false, false, true];"],
  ["Matrix declarations", "|int64| m1 = |2, 4, 3; 7, 6, 5|; |float| m2 = |1.2; 8.65; 9.76|;"],
  ["Vector declarations", "<int> v1 = <1, 2>; <float> v2 = <5.43, 9.12, 15.3>;"],
  ["Point declarations", "(int) p1 = (3, 5, 1); (float64) p2 = (5.234, 19.65);"],
  ["function with no params, no return type", "function f() {};"],
  ["function with one param", "function f(a) {};"],
  ["function with two params", "function f(a, b) {};"],
  ["function with no params + return type", "function bool f() {};"],
  ["optional function types in params", "function f(int32 a, float b, bool c, d, e, string f) {};"],
  ["array type for param", "function f([int] a, [string] b, [float64] c) {};"],
  ["array type returned", "function [int] f() {};"],
  ["matrix type for param", "function f(|int| a, |float64| b) {};"],
  ["matrix type returned", "function |int32| f() {};"],
  ["vector type for param", "function f(<float32> a, <int64> b) {};"],
  ["vector type returned", "function <float> f() {};"],
  ["point type for param", "function f((int) a, (float64) b) {};"],
  ["point type returned", "function (int64) f() {};"],
  ["assignments", "a = 3; b = 3 * <3, 4>; c = (3, 1) <*> <4, 3> * 10; d = |3, 2; 7, 9; 9; 6| |*| |10; 6|;"],
  ["call in statement, no types", "int x = 1; f( 2, 9); print(x);"],
  ["call in statement, with types", "(int) p = (3, 7, 4); f( int 21, float 4.64); print(y);"]
  ["call in exp", "print(5 * f(x, y, 2 * y));"],
  ["short if", "int x = 1; ifconditional true { x = 5; };"],
  ["longer if", "int x = 1; ifconditional true { x = 5; }; otherwise { x = 10; };"],

  ["even longer if", "if true { print(1); } else if false { print(1);}"],
  ["while with empty block", "while true {}"],
  ["while with one statement block", "while true { let x = 1; }"],
  ["repeat with long block", "repeat 2 { print(1);\nprint(2);print(3); }"],
  ["if inside loop", "repeat 3 { if true { print(1); } }"],
  ["for closed range", "for i in 2...9*1 {}"],
  ["for half-open range", "for i in 2..<9*1 {}"],
  ["for collection-as-id", "for i in things {}"],
  ["for collection-as-lit", "for i in [3,5,8] {}"],
  ["conditional", "return x?y:z?y:p;"],
  ["??", "return a ?? b ?? c ?? d;"],
  ["ors can be chained", "print(1 || 2 || 3 || 4 || 5);"],
  ["ands can be chained", "print(1 && 2 && 3 && 4 && 5);"],
  ["bitwise ops", "return (1|2|3) + (4^5^6) + (7&8&9);"],
  ["relational operators", "print(1<2||1<=2||1==2||1!=2||1>=2||1>2);"],
  ["shifts", "return 3 << 5 >> 8 << 13 >> 21;"],
  ["arithmetic", "return 2 * x + 3 / 5 - -1 % 7 ** 3 ** 3;"],
  ["length", "return #c; return #[1,2,3];"],
  ["boolean literals", "let x = false || true;"],
  ["all numeric literal forms", "print(8 * 89.123 * 1.3E5 * 1.3E+5 * 1.3E-5);"],
  ["empty array literal", "print(emptyArrayOf(int));"],
  ["nonempty array literal", "print([1, 2, 3]);"],
  ["some operator", "return some dog;"],
  ["no operator", "return no dog;"],
  ["parentheses", "print(83 * ((((((((-(13 / 21))))))))) + 1 - 0);"],
  ["variables in expression", "return r.p(3,1)[9]?.x?.y.z.p()(5)[1];"],
  ["more variables", "return c(3).p?.oh(9)[2][2].nope(1)[3](2);"],
  ["indexing array literals", "print([1,2,3][1]);"],
  ["member expression on string literal", `print("hello".append("there"));`],
  ["non-Latin letters in identifiers", "let コンパイラ = 100;"],
  ["a simple string literal", 'print("hello😉😬💀🙅🏽‍♀️—`");'],
  ["string literal with escapes", 'return "a\\n\\tbc\\\\de\\"fg";'],
  ["u-escape", 'print("\\u{a}\\u{2c}\\u{1e5}\\u{ae89}\\u{1f4a9}\\u{10ffe8}");'],
  ["end of program inside comment", "print(0); // yay"],
  ["comments with no text", "print(1);//\nprint(0);//"],
]

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  ["a missing right operand", "print(5 -", /Line 1, col 10/],
  ["a non-operator", "print(7 * ((2 _ 3)", /Line 1, col 15/],
  ["an expression starting with a )", "x = );", /Line 1, col 5/],
  ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  ["an illegal statement on line 2", "print(5);\nx * 5;", /Line 2, col 3/],
  ["a statement starting with a )", "print(5);\n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
]

describe("The grammar", () => {
  const grammar = ohm.grammar(fs.readFileSync("grammar/bismath.ohm"))
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(grammar.match(source).succeeded())
    })
  }
  //   for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
  //     it(`does not permit ${scenario}`, () => {
  //       const match = grammar.match(source)
  //       assert(!match.succeeded())
  //       assert(new RegExp(errorMessagePattern).test(match.message))
  //     })
  //   }
})
