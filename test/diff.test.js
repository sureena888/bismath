import assert from "assert/strict";
import { derivative } from "../diff.js";

describe("The differentiator", () => {
  it("detects malformed polynomials", () => {
    assert.throws(() => derivative("2y"));
    assert.throws(() => derivative("blah"));
    assert.throws(() => derivative("2x*6"));
  });
  it("correctly differentiates single-term polynomials", () => {
    assert.equal(derivative("4"), "0");
    assert.equal(derivative("2238"), "0");
    assert.equal(derivative("x"), "1");
    assert.equal(derivative("4x"), "4");
    assert.equal(derivative("x^5"), "5x^4");
    assert.equal(derivative("2x^-4"), "-8x^-5");
  });
  it("correctly differentiates multi-term polynomials", () => {
    assert.equal(derivative("-4"), "-0");
    assert.equal(derivative("-2238"), "-0");
    assert.equal(derivative("-x"), "-1");
    assert.equal(derivative("-x^5"), "-5x^4");
    assert.equal(derivative("-x^-5"), "+5x^-6");
    assert.equal(derivative("2x^-4    + 7x^2"), "-8x^-5+14x^1");
    assert.equal(derivative("   2x^-4- 7x^20"), "-8x^-5-140x^19");
    assert.equal(derivative("2x^-4       +7x^-2"), "-8x^-5-14x^-3");
  });
});
