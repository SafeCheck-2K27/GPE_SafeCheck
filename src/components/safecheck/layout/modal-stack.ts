export interface ModalStackEntry<T> {
  id: symbol
  value: T
}

export class ModalStack<T> {
  private readonly items: ModalStackEntry<T>[] = []

  add(id: symbol, value: T) {
    this.remove(id)
    this.items.push({ id, value })
  }

  remove(id: symbol): ModalStackEntry<T> | undefined {
    const index = this.items.findIndex((entry) => entry.id === id)
    if (index < 0) return undefined
    return this.items.splice(index, 1)[0]
  }

  isTop(id: symbol): boolean {
    return this.items[this.items.length - 1]?.id === id
  }

  get entries(): readonly ModalStackEntry<T>[] {
    return this.items
  }

  get size(): number {
    return this.items.length
  }
}
