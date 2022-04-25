import assert from "assert/strict"
import util from "util"
import ast from "../src/ast.js"

const source = `
  x = 1;
  y = "hello";
  output [1.0, 2.0];
  output a[1][2];
  function f(z) {
    (z != 0) -> { z = z - 1; } otherwise { getout; }
  }
  f(3 * 7 && 2);
  for animal in animals {
    put animal;
  }
  `

const expected = `
   1 | Program statements=[#2,#3,#4,#6,#9,#15,#19]
   2 | Assignment target=(Id,"x") source=(Num,"1")
   3 | Assignment target=(Id,"y") source=(Str,""hello"")
   4 | ReturnStatement argument=[#5]
   5 | MatrixExpression elements=[(Num,"1.0"),(Num,"2.0")]
   6 | ReturnStatement argument=[#7]
   7 | LookupExpression collection=#8 index=(Num,"2")
   8 | LookupExpression collection=(Id,"a") index=(Num,"1")
   9 | FunctionDeclaration fun=(Id,"f") params=[(Id,"z")] body=[#10]
  10 | IfStatement test=#11 consequent=[#12] alternate=[#14]
  11 | BinaryExpression op=(Sym,"!=") left=(Id,"z") right=(Num,"0")
  12 | Assignment target=(Id,"z") source=#13
  13 | BinaryExpression op=(Sym,"-") left=(Id,"z") right=(Num,"1")
  14 | BreakStatement 
  15 | ExpressionStatement expression=#16
  16 | Call callee=(Id,"f") args=[#17]
  17 | BinaryExpression op=(Sym,"&&") left=#18 right=(Num,"2")
  18 | BinaryExpression op=(Sym,"*") left=(Num,"3") right=(Num,"7")
  19 | ForStatement iterator=(Id,"animal") collection=(Id,"animals") body=[#20]
  20 | PrintStatement argument=(Id,"animal")
  `

describe("The AST generator", () => {
  it("produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source)), expected)
  })
})
