import assert from "assert/strict"
import util from "util"
import ast from "../src/ast.js"

const source = `
  set x = 1;
  set y = "hello";
  fix v = <1,2,3,4>;
  output [1.0, 2.0];
  output v[1][2];
  function f(z) {
    (z != 0) -> { z = z - 1; output z;} otherwise { output "some random message"; }
  }
  set z = f(3 * 7 && 2);
  set threeByThree = [[1,2,3], [4,5,6], [7,8,9]];
  for row in threeByThree {
    for col in row {
      put row;
      put col;
    }
  }
  while true {
    (a > 0 && z != 0) -> {put "trying to get 100 percent coverage";} otherwise (a < 0 || z > 0) -> {getout;}
  }
  put true? f(0) : y;
  `

const expected = `   1 | Program statements=[#2,#3,#4,#6,#8,#11,#18,#22,#27,#31,#42]
   2 | VariableDeclaration modifier=(Sym,"set") variable=(Id,"x") initializer=(Num,"1")
   3 | VariableDeclaration modifier=(Sym,"set") variable=(Id,"y") initializer=(Str,""hello"")
   4 | VariableDeclaration modifier=(Sym,"fix") variable=(Id,"v") initializer=#5
   5 | VectorExpression elements=[(Num,"1"),(Num,"2"),(Num,"3"),(Num,"4")]
   6 | ReturnStatement argument=[#7]
   7 | MatrixExpression elements=[(Num,"1.0"),(Num,"2.0")]
   8 | ReturnStatement argument=[#9]
   9 | LookupExpression collection=#10 index=(Num,"2")
  10 | LookupExpression collection=(Id,"v") index=(Num,"1")
  11 | FunctionDeclaration fun=(Id,"f") params=[(Id,"z")] body=[#12]
  12 | IfStatement test=#13 consequent=[#14,#16] alternate=[#17]
  13 | BinaryExpression op=(Sym,"!=") left=(Id,"z") right=(Num,"0")
  14 | Assignment target=(Id,"z") source=#15
  15 | BinaryExpression op=(Sym,"-") left=(Id,"z") right=(Num,"1")
  16 | ReturnStatement argument=[(Id,"z")]
  17 | ReturnStatement argument=[(Str,""some random message"")]
  18 | VariableDeclaration modifier=(Sym,"set") variable=(Id,"z") initializer=#19
  19 | Call callee=(Id,"f") args=[#20]
  20 | BinaryExpression op=(Sym,"&&") left=#21 right=(Num,"2")
  21 | BinaryExpression op=(Sym,"*") left=(Num,"3") right=(Num,"7")
  22 | VariableDeclaration modifier=(Sym,"set") variable=(Id,"threeByThree") initializer=#23
  23 | MatrixExpression elements=[#24,#25,#26]
  24 | MatrixExpression elements=[(Num,"1"),(Num,"2"),(Num,"3")]
  25 | MatrixExpression elements=[(Num,"4"),(Num,"5"),(Num,"6")]
  26 | MatrixExpression elements=[(Num,"7"),(Num,"8"),(Num,"9")]
  27 | ForStatement iterator=(Id,"row") collection=(Id,"threeByThree") body=[#28]
  28 | ForStatement iterator=(Id,"col") collection=(Id,"row") body=[#29,#30]
  29 | PrintStatement argument=(Id,"row")
  30 | PrintStatement argument=(Id,"col")
  31 | WhileStatement test=(Bool,"true") body=[#32]
  32 | IfStatement test=#33 consequent=[#36] alternate=#37
  33 | BinaryExpression op=(Sym,"&&") left=#34 right=#35
  34 | BinaryExpression op=(Sym,">") left=(Id,"a") right=(Num,"0")
  35 | BinaryExpression op=(Sym,"!=") left=(Id,"z") right=(Num,"0")
  36 | PrintStatement argument=(Str,""trying to get 100 percent coverage"")
  37 | ShortIfStatement test=#38 consequent=[#41]
  38 | BinaryExpression op=(Sym,"||") left=#39 right=#40
  39 | BinaryExpression op=(Sym,"<") left=(Id,"a") right=(Num,"0")
  40 | BinaryExpression op=(Sym,">") left=(Id,"z") right=(Num,"0")
  41 | BreakStatement 
  42 | PrintStatement argument=#43
  43 | Conditional test=(Bool,"true") consequent=#44 alternate=(Id,"y")
  44 | Call callee=(Id,"f") args=[(Num,"0")]`

describe("The AST generator", () => {
  it("produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source)), expected)
  })
})
