import type { StoreApi, StateUpdater } from './types'
import { hasChanged } from './hasChanged'

/**
 * Creates a zero-dependency in-memory store.
 *
 * Holds state in a plain JS object. Notifies subscribers only when
 * a patched key actually changes (shallow `Object.is` comparison).
 *
 * @param initialState - The starting state value.
 * @returns A `StoreApi<T>` with `getState`, `setState`, and `subscribe`.
 */
export function createGrimoire<T extends object>(initialState: T): StoreApi<T> {
  let state = initialState
  const listeners = new Set<(state: T, previousState: T) => void>()

  const getState = (): T => state

  const setState = (partial: StateUpdater<T>): void => {
    const prev = state
    // resolve the patch: call the updater fn with current state, or use the plain object as-is
    const patch = typeof partial === 'function' ? partial(prev) : partial
    const patchedState = { ...prev, ...patch }
    // skip if every patched key is identical — avoids unnecessary re-renders
    if (!hasChanged(prev, patchedState, patch)) return
    state = patchedState
    listeners.forEach((fn) => fn(state, prev))
  }

  const subscribe = (listener: (state: T, previousState: T) => void): (() => void) => {
    // Set deduplicates — same reference added twice = one entry
    listeners.add(listener)
    // call to unsubscribe and avoid memory leaks
    return () => listeners.delete(listener)
  }

  return { getState, setState, subscribe }
}
