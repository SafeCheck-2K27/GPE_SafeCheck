import { test, expect } from "vitest"
import { ModalStack } from "../../src/components/safecheck/layout/modal-stack"

test("modal stack keeps the most recently opened modal on top", () => {
  const stack = new ModalStack<string>()
  const first = Symbol("first")
  const second = Symbol("second")

  stack.add(first, "first modal")
  stack.add(second, "second modal")

  expect(stack.isTop(first)).toBe(false)
  expect(stack.isTop(second)).toBe(true)
  expect(stack.entries.map(({ value }) => value)).toEqual(["first modal", "second modal"])
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

  expect(stack.isTop(third)).toBe(true)
  expect(stack.size).toBe(2)

  stack.remove(third)

  expect(stack.isTop(first)).toBe(true)
  expect(stack.size).toBe(1)
})