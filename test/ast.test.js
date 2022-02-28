import assert from "assert/strict"
import util from "util"
import ast from "../src/ast.js"

const source = `declare b = 5 + (7-9) * (4+1)`

const expected = `   1 | Program statements=[#2]
   2 | Program statements = [#2]
   3 | Array 0=#3 1=#8 2=#10
   4 | BinaryExpression op=(Sym,"+") left=(Num,"5") right=#5
   5 | BinaryExpression op=(Sym,"*") left=#6 right=#7
   6 | BinaryExpression op=(Sym,"-") left=(Num,"7") right=(Num,"9")
   7 | BinaryExpression op=(Sym,"+") left=(Num,"4") right=(Num,"1")
   8 | VariableDeclaration variable=(Id,"a") initializer=#9
   9 | BinaryExpression op=(Sym,"+") left=(Num,"2") right=(Num,"4")
  10 | PrintStatement argument=[(Id,"a")]`

describe("The AST generator", () => {
  it("produces the expected AST for all node types", () => {
    assert.deepEqual(util.format(ast(source)), expected)
  })
})
