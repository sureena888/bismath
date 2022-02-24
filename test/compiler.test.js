import assert from "assert"
import { add, times } from "../src/bismath"

describe("The Compiler", () => {
  describe("has an add function()", () => {
    it("should return 4 when adding 2 and 2 ", () => {
      assert.deepEqual(add(2, 2), 4)
    })
  })
  describe("has a times function", () => {
    it("should return 4 when multiplying 2 and 2 ", () => {
      assert.deepEqual(times(2, 2), 4)
    })
    it("returns 0 when multipling by 0 ", () => {
      assert.deepEqual(times(2, 0), 0)
      assert.deepEqual(times(0, 98765456789), 0)
      assert.deepEqual(times(0, 0), 0)
    })
  })
})
