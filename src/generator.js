// CODE GENERATOR: Carlos -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import { IfStatement, standardLibrary } from "./core.js"
// import stdlib from "./core.js"

export default function generate(program) {
  const output = []

  // const standardFunctions = new Map([
  //   [standardLibrary.contents.print, (x) => `console.log(${x})`],
  //   [standardLibrary.contents.sin, (x) => `Math.sin(${x})`],
  //   [standardLibrary.contents.cos, (x) => `Math.cos(${x})`],
  //   [standardLibrary.contents.exp, (x) => `Math.exp(${x})`],
  //   [standardLibrary.contents.ln, (x) => `Math.log(${x})`],
  //   [standardLibrary.contents.hypot, ([x, y]) => `Math.hypot(${x},${y})`],

  //   [
  //     standardLibrary.contents.Determinant,
  //     ([matrix]) => `

  //   `,
  //   ],
  // ])

  // Variable and function names in JS will be suffixed with _1, _2, _3,
  // etc. This is because "switch", for example, is a legal name in Carlos,
  // but not in JS. So, the Carlos variable "switch" must become something
  // like "switch_1". We handle this by mapping each name to its suffix.
  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`
    }
  })(new Map())

  function gen(node) {
    return generators[node.constructor.name](node)
  }

  const generators = {
    // Key idea: when generating an expression, just return the JS string; when
    // generating a statement, write lines of translated JS to the output array.
    Program(p) {
      gen(p.statements)
    },
    VariableDeclaration(d) {
      // We don't care about const vs. let in the generated code! The analyzer has
      // already checked that we never updated a const, so let is always fine.
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
    },
    FunctionDeclaration(d) {
      output.push(`function ${gen(d.fun)}(${gen(d.params).join(", ")}) {`)
      gen(d.body)
      output.push("}")
    },
    Parameter(p) {
      return targetName(p)
    },
    Variable(v) {
      // Standard library constants just get special treatment
      // if (v === standardLibrary.contents.π) {
      //   return "Math.PI"
      // }
      return targetName(v)
    },
    Function(f) {
      return targetName(f)
    },
    //   Assignment(s) {
    //     output.push(`${gen(s.target)} = ${gen(s.source)};`)
    //   },
    //   BreakStatement(s) {
    //     output.push("break;")
    //   },
    ReturnStatement(s) {
      const returnValue = s.argument === null ? "" : gen(s.argument)
      output.push(`return ${returnValue};`)
    },
    PrintStatement(s) {
      output.push(`console.log(${gen(s.argument)});`)
    },
    //   IfStatement(s) {
    //     output.push(`if (${gen(s.test)}) {`)
    //     gen(s.consequent)
    //     if (s.alternate.constructor === IfStatement) {
    //       output.push("} else")
    //       gen(s.alternate)
    //     } else {
    //       output.push("} else {")
    //       gen(s.alternate)
    //       output.push("}")
    //     }
    //   },
    //   ShortIfStatement(s) {
    //     output.push(`if (${gen(s.test)}) {`)
    //     gen(s.consequent)
    //     output.push("}")
    //   },
    //   WhileStatement(s) {
    //     output.push(`while (${gen(s.test)}) {`)
    //     gen(s.body)
    //     output.push("}")
    //   },
    //   ForStatement(s) {
    //     output.push(`for (let ${gen(s.iterator)} of ${gen(s.collection)}) {`)
    //     gen(s.body)
    //     output.push("}")
    //   },
    //   Conditional(e) {
    //     return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(e.alternate)}))`
    //   },
    BinaryExpression(e) {
      const ops = {
        "+": "__plus",
        "*": "__times",
      }
      return `${ops[e.op]}(${gen(e.left)},${gen(e.right)})`
    },
    //   UnaryExpression(e) {
    //     return `${e.op}(${gen(e.operand)})`
    //   },
    //   SubscriptExpression(e) {
    //     return `${gen(e.array)}[${gen(e.index)}]`
    //   },
    MatrixExpression(e) {
      return `[${gen(e.elements).join(",")}]`
    },
    //   EmptyArray(e) {
    //     return "[]"
    //   },
    //   MemberExpression(e) {
    //     return `(${gen(e.object)}[${JSON.stringify(gen(e.field))}])`
    //   },
    //   Call(c) {
    //     const targetCode = standardFunctions.has(c.callee)
    //       ? standardFunctions.get(c.callee)(gen(c.args))
    //       : c.callee.constructor === StructType
    //       ? `new ${gen(c.callee)}(${gen(c.args).join(", ")})`
    //       : `${gen(c.callee)}(${gen(c.args).join(", ")})`
    //     // Calls in expressions vs in statements are handled differently
    //     if (c.callee instanceof Type || c.callee.type.returnType !== Type.VOID) {
    //       return targetCode
    //     }
    //     output.push(`${targetCode};`)
    //   },
    Number(e) {
      return e
    },
    Boolean(e) {
      return e
    },
    String(e) {
      return e
    },
    Array(a) {
      return a.map(gen)
    },
  }

  gen(program)
  return output.join("\n")
}
