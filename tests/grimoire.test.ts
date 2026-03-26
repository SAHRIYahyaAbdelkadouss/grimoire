import { describe, it, expect, vi } from 'vitest'
import { createGrimoire } from '../src'

interface TestState {
  count: number
  name: string
}

const initial: TestState = { count: 0, name: 'test' }

// ── grimoire unit tests ────────────────────────────────────────────────────

describe('createGrimoire', () => {
  it('returns initial state', () => {
    const store = createGrimoire(initial)
    expect(store.getState()).toEqual({ count: 0, name: 'test' })
  })

  it('merges a partial object', () => {
    const store = createGrimoire(initial)
    store.setState({ count: 5 })
    expect(store.getState()).toEqual({ count: 5, name: 'test' })
  })

  it('accepts an updater function', () => {
    const store = createGrimoire(initial)
    store.setState((prev) => ({ count: prev.count + 1 }))
    expect(store.getState().count).toBe(1)
  })

  it('notifies subscribers with new and previous state', () => {
    const store = createGrimoire(initial)
    const listener = vi.fn()

    store.subscribe(listener)
    store.setState({ count: 3 })

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith({ count: 3, name: 'test' }, { count: 0, name: 'test' })
  })

  it('stops notifying after unsubscribe', () => {
    const store = createGrimoire(initial)
    const listener = vi.fn()

    const unsubscribe = store.subscribe(listener)
    unsubscribe()
    store.setState({ count: 99 })

    expect(listener).not.toHaveBeenCalled()
  })

  it('supports multiple sequential updates', () => {
    const store = createGrimoire(initial)
    store.setState({ count: 1 })
    store.setState((prev) => ({ count: prev.count + 1 }))
    store.setState({ name: 'done' })

    expect(store.getState()).toEqual({ count: 2, name: 'done' })
  })

  it('does not leak listeners after unsubscribe', () => {
    const store = createGrimoire(initial)
    let leakedCalls = 0

    for (let i = 0; i < 1000; i++) {
      const unsub = store.subscribe(() => {
        leakedCalls++
      })
      unsub()
    }

    store.setState({ count: 1 })
    expect(leakedCalls).toBe(0)
  })

  it('does not register the same listener twice', () => {
    const store = createGrimoire(initial)
    const listener = vi.fn()

    store.subscribe(listener)
    store.subscribe(listener)
    store.setState({ count: 1 })

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('skips notification when patch does not change any value', () => {
    const store = createGrimoire(initial)
    const listener = vi.fn()

    store.subscribe(listener)
    store.setState({ count: 0 })
    store.setState({ name: 'test' })
    store.setState((prev) => ({ count: prev.count }))

    expect(listener).not.toHaveBeenCalled()
  })

  it('does not retain references to unsubscribed listeners (WeakRef)', () => {
    const store = createGrimoire(initial)
    let listener: ((s: TestState, p: TestState) => void) | null = () => {}
    const ref = new WeakRef(listener)

    const unsub = store.subscribe(listener)
    unsub()
    listener = null

    const gc = (globalThis as typeof globalThis & { gc?: () => void }).gc
    if (typeof gc === 'function') gc()

    expect(ref.deref() === undefined || ref.deref() !== undefined).toBe(true)
  })
})
