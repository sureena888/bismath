export function derivative(poly) {
  console.log([...tokenize(poly)]);
  return differentiate([...parse([...tokenize(poly)])]);
}

class Term {
  constructor(coefficient, exponent) {
    this.coefficient = Number(coefficient);
    this.exponenet = Number(exponent);
  }
}

class Operator {
  constructor(lexeme) {
    this.lexeme = lexeme;
  }
}

function* tokenize(polynomial) {
  for (let i = 0; i < polynomial.length; ) {
    while (/[\t]/.test(polynomial[i])) i++;

    let category;
    let start = i++;
    let number = "";
    let exp = "";
    let polyArray;
    if ((polyArray = /[+-]/.exec(polynomial))) {
      category = "sign";
      //console.log(polyArray);
      yield new Operator(polynomial.charAt(start));
    } else if ((polyArray = /\d+("."\d+)?x\^("-"?\d+)/.exec(polynomial))) {
      console.log(polyArray);
      //number = number + polynomial.charAt(start);
      //   while (/\d+("."\d+)?x\^("-"?\d+)/.exec(polynomial[i])) i++;
      //   number = number + polynomial.charAt(i);
      //   category = "coefficient";
    } else if ((polyArray = /[x^]/.exec(polynomial))) {
      console.log(polyArray);
      //exp = exp + polynomial.charAt(start);
    } else {
      throw "input is not a polynomial";
    }

    yield new Term(number, exp);
  }
}

function* parse(tokens) {
  function at(expected) {}

  function match(expected) {}
  // parse it
  let op;
  if (at(Operator)) {
    op = match();
  }

  while (at(Operator)) {}
}

function* differentiate(terms) {}
