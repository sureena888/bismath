// CODE GENERATOR: Bismath -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import { IfStatement, standardLibrary } from "./core.js"
// import stdlib from "./core.js"

function isMatrix(m) {
  if (m.length !== 0) return Array.isArray(m[0])
}
function checkColumns(m) {
  m.forEach((row, idx) => {
    if (idx + 1 !== m.length) {
      if (row.length !== m[idx + 1].length) throw new Error("Column dimension error")
    }
  })
}
function getMatrixDims(m) {
  return [m.length, m[0].length] //rows, cols
}

function getColumns(b) {
  bCols = []
  for (let col = 0; col < b[0].length; col++) {
    let bColumn = []
    for (let row = 0; row < b.length; row++) {
      bColumn.push(b[row][col])
    }
    bCols.push(bColumn)
  }
  return bCols
}

function sum(array) {
  return array.reduce((a, b) => a + b, 0)
}

function __plus(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a + b
  } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    if (isMatrix(a) && isMatrix(b)) {
      checkColumns(a)
      checkColumns(b)
      const [aRows, aCols] = getMatrixDims(a)
      const [bRows, bCols] = getMatrixDims(b)
      if (aRows === bRows && aCols === bCols) {
        return a.map((row, idx) => row.map((col, i) => col + b[idx][i]))
      } else {
        throw new Error("The dimensions of the matrices must match")
      }
    }

    return a.map((x, i) => x + b[i])
  }
}

function __minus(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b
  } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    if (isMatrix(a) && isMatrix(b)) {
      checkColumns(a)
      checkColumns(b)
      const [aRows, aCols] = getMatrixDims(a)
      const [bRows, bCols] = getMatrixDims(b)
      if (aRows === bRows && aCols === bCols) {
        return a.map((row, idx) => row.map((col, i) => col - b[idx][i]))
      } else {
        throw new Error("The dimensions of the matrices must match")
      }
    }

    return a.map((x, i) => x - b[i])
  }
}

function __times(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a * b
  } else if (isMatrix(a) && isMatrix(b)) {
    checkColumns(a)
    checkColumns(b)
    const [aRows, aCols] = getMatrixDims(a)
    const [bRows, bCols] = getMatrixDims(b)
    if (aCols === bRows) {
      let bColumns = getColumns(b)
      let result = []
      for (let row = 0; row < a.length; row++) {
        newRow = []
        for (let col = 0; col < bColumns.length; col++) {
          products = []
          for (let i = 0; i < a[row].length; i++) {
            products.push(a[row][i] * bColumns[col][i])
          }
          newRow.push(sum(products))
        }
        result.push(newRow)
      }
      return result
    } else {
      throw new Error("Error: unable to apply these matrices b/c of their dimensions")
    }
  } else if (Array.isArray(a) && typeof b === "number") {
    if (isMatrix(a)) {
      checkColumns(a)
      return a.map((row) => row.map((col) => col * b))
    } else {
      return a.map((value) => value * b)
    }
  } else if (typeof a === "number" && Array.isArray(b)) {
    if (isMatrix(b)) {
      checkColumns(b)
      return b.map((row) => row.map((col) => col * a))
    } else {
      return b.map((value) => value * a)
    }
  } else {
    throw new Error("Error. Replace with a descriptive message.")
  }
}

function __divide(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a / b
  } else {
    throw new Error("Can only divide numbers")
  }
}

function __equal(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a === b
  } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    if (isMatrix(a) && isMatrix(b)) {
      checkColumns(a)
      checkColumns(b)
      const [aRows, aCols] = getMatrixDims(a)
      const [bRows, bCols] = getMatrixDims(b)
      if (aRows === bRows && aCols === bCols) {
        a.forEach((row, idx) =>
          row.forEach((col, i) => {
            if (col !== b[idx][i]) return false
          })
        )
        return true
      }
    } else {
      a.forEach((value, i) => {
        if (value !== b[i]) return false
      })
      return true
    }
  }
  return false
}

function __notEqual(a, b) {
  let equal = __equal(a, b)
  return !equal
}

function __and(a, b) {
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a && b
  } else {
    throw new Error("Error: && only works with booleans")
  }
}

function __or(a, b) {
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a && b
  } else {
    throw new Error("Error: || only works with booleans")
  }
}

function __exponentiation(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a ** b
  } else {
    throw new Error("Error: ^ only works with numbers")
  }
}

function __modulus(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a % b
  } else {
    throw new Error("Error: % only works with numbers")
  }
}

function __lessThan(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a < b
  } else {
    throw new Error("Error: < only works with numbers")
  }
}

function __greaterThan(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a > b
  } else {
    throw new Error("Error: > only works with numbers")
  }
}

function __lessOrEqual(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a <= b
  } else {
    throw new Error("Error: <= only works with numbers")
  }
}

function __greaterOrEqual(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a >= b
  } else {
    throw new Error("Error: >= only works with numbers")
  }
}

export default function generate(program) {
  const output = [
    `function isMatrix(m) {
  if (m.length !== 0) return Array.isArray(m[0])
}
function checkColumns(m) {
  m.forEach((row, idx) => {
    if (idx + 1 !== m.length) {
      if (row.length !== m[idx + 1].length) throw new Error("Column dimension error")
    }
  })
}
function getMatrixDims(m) {
  return [m.length, m[0].length] //rows, cols
}

function getColumns(b) {
  bCols = []
  for (let col = 0; col < b[0].length; col++) {
    let bColumn = []
    for (let row = 0; row < b.length; row++) {
      bColumn.push(b[row][col])
    }
    bCols.push(bColumn)
  }
  return bCols
}

function sum(array) {
  return array.reduce((a, b) => a + b, 0)
}

function __plus(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a + b
  } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    if (isMatrix(a) && isMatrix(b)) {
      checkColumns(a)
      checkColumns(b)
      const [aRows, aCols] = getMatrixDims(a)
      const [bRows, bCols] = getMatrixDims(b)
      if (aRows === bRows && aCols === bCols) {
        return a.map((row, idx) => row.map((col, i) => col + b[idx][i]))
      } else {
        throw new Error("The dimensions of the matrices must match")
      }
    }

    return a.map((x, i) => x + b[i])
  }
}

function __minus(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b
  } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    if (isMatrix(a) && isMatrix(b)) {
      checkColumns(a)
      checkColumns(b)
      const [aRows, aCols] = getMatrixDims(a)
      const [bRows, bCols] = getMatrixDims(b)
      if (aRows === bRows && aCols === bCols) {
        return a.map((row, idx) => row.map((col, i) => col - b[idx][i]))
      } else {
        throw new Error("The dimensions of the matrices must match")
      }
    }

    return a.map((x, i) => x - b[i])
  }
}

function __times(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a * b
  } else if (isMatrix(a) && isMatrix(b)) {
    checkColumns(a)
    checkColumns(b)
    const [aRows, aCols] = getMatrixDims(a)
    const [bRows, bCols] = getMatrixDims(b)
    if (aCols === bRows) {
      let bColumns = getColumns(b)
      let result = []
      for (let row = 0; row < a.length; row++) {
        newRow = []
        for (let col = 0; col < bColumns.length; col++) {
          products = []
          for (let i = 0; i < a[row].length; i++) {
            products.push(a[row][i] * bColumns[col][i])
          }
          newRow.push(sum(products))
        }
        result.push(newRow)
      }
      return result
    } else {
      throw new Error("Error: unable to apply these matrices b/c of their dimensions")
    }
  } else if (Array.isArray(a) && typeof b === "number") {
    if (isMatrix(a)) {
      checkColumns(a)
      return a.map((row) => row.map((col) => col * b))
    } else {
      return a.map((value) => value * b)
    }
  } else if (typeof a === "number" && Array.isArray(b)) {
    if (isMatrix(b)) {
      checkColumns(b)
      return b.map((row) => row.map((col) => col * a))
    } else {
      return b.map((value) => value * a)
    }
  } else {
    throw new Error("Error. Replace with a descriptive message.")
  }
}

function __divide(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a / b
  } else {
    throw new Error("Can only divide numbers")
  }
}

function __equal(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a === b
  } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    if (isMatrix(a) && isMatrix(b)) {
      checkColumns(a)
      checkColumns(b)
      const [aRows, aCols] = getMatrixDims(a)
      const [bRows, bCols] = getMatrixDims(b)
      if (aRows === bRows && aCols === bCols) {
        a.forEach((row, idx) =>
          row.forEach((col, i) => {
            if (col !== b[idx][i]) return false
          })
        )
        return true
      }
    } else {
      a.forEach((value, i) => {
        if (value !== b[i]) return false
      })
      return true
    }
  }
  return false
}

function __notEqual(a, b) {
  let equal = __equal(a, b)
  return !equal
}

function __and(a, b) {
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a && b
  } else {
    throw new Error("Error: && only works with booleans")
  }
}

function __or(a, b) {
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a && b
  } else {
    throw new Error("Error: || only works with booleans")
  }
}

function __exponentiation(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a ** b
  } else {
    throw new Error("Error: ^ only works with numbers")
  }
}

function __modulus(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a % b
  } else {
    throw new Error("Error: % only works with numbers")
  }
}

function __lessThan(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a < b
  } else {
    throw new Error("Error: < only works with numbers")
  }
}

function __greaterThan(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a > b
  } else {
    throw new Error("Error: > only works with numbers")
  }
}

function __lessOrEqual(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a <= b
  } else {
    throw new Error("Error: <= only works with numbers")
  }
}

function __greaterOrEqual(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a >= b
  } else {
    throw new Error("Error: >= only works with numbers")
  }
}`,
  ]

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
    // Parameter(p) {
    //   return targetName(p)
    // },
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
        "-": "__minus",
        "*": "__times",
        "/": "__divide",
        "%": "__modulus",
        "&&": "__and",
        "||": "__or",
        "<": "__lessThan",
        ">": "__greaterThan",
        "<=": "__lessOrEqual",
        ">=": "__greaterOrEqual",
        "!=": "__notEqual",
        "==": "__equal",
        "^": "__exponentiation",
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
