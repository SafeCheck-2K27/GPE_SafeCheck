import assert from "node:assert/strict"
import { test } from "node:test"
import { ModalStack } from "../../src/components/safecheck/layout/modal-stack"

test("modal stack keeps the most recently opened modal on top", () => {
  const stack = new ModalStack<string>()
  const first = Symbol("first")
  const second = Symbol("second")

  stack.add(first, "first modal")
  stack.add(second, "second modal")

  assert.equal(stack.isTop(first), false)
  assert.equal(stack.isTop(second), true)
  assert.deepEqual(
    stack.entries.map(({ value }) => value),
    ["first modal", "second modal"],
  )
})

test("modal stack restores the previous top after ordered or abrupt removal", () => {
  const stack = new ModalStack<string>()
  const first = Symbol("first")
  const second = Symbol("second")
  const third = Symbol("third")

  stack.add(first, "first modal")
  stack.add(second, "second modal")
  stack.add(third, "third modal")
  stack.remove(second)

  assert.equal(stack.isTop(third), true)
  assert.equal(stack.size, 2)

  stack.remove(third)

  assert.equal(stack.isTop(first), true)
  assert.equal(stack.size, 1)
})
