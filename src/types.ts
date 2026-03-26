// ─── Store adapter contract ─────────────────────────────────────────────────

/**
 * Describes what you can pass to `setState`.
 *
 * Two forms are accepted:
 * - **Object** — a partial snapshot that gets merged into the current state.
 * - **Updater function** — receives the previous state and returns a partial to merge.
 *
 * @template T - The shape of the full state object.
 *
 * @example
 * ```ts
 * // Object form — merge { name: 'Alice' } into current state
 * store.setState({ name: 'Alice' })
 *
 * // Updater form — read previous state before computing next
 * store.setState((prev) => ({ count: prev.count + 1 }))
 * ```
 */
export type StateUpdater<T> = Partial<T> | ((prev: T) => Partial<T>)

/**
 * The minimal 3-method contract that every store adapter must return.
 *
 * This is the only interface `useStore`, `useStoreSelector`, and
 * `createWizardcraftStore` depend on — making the React layer completely
 * independent of the underlying state library (Vanilla JS, Zustand, MobX, …).
 *
 * @template T - The shape of the state object held by this store.
 *
 * @example
 * ```ts
 * const store: StoreApi<{ count: number }> = createVanillaAdapter().createStore({ count: 0 })
 *
 * store.getState()           // → { count: 0 }
 * store.setState({ count: 1 })
 * store.getState()           // → { count: 1 }
 *
 * const unsub = store.subscribe((next, prev) => {
 *   console.log('changed from', prev.count, 'to', next.count)
 * })
 * unsub() // stop listening
 * ```
 */
export interface StoreApi<T> {
  /**
   * Returns the current state snapshot.
   *
   * This is called synchronously by `useSyncExternalStore` on every render,
   * so it must always return the **latest** value — never a stale reference.
   */
  getState(): T

  /**
   * Merges a partial update into the current state and notifies all subscribers.
   *
   * Accepts either a plain partial object or an updater function that receives
   * the previous state and returns a partial. See {@link StateUpdater}.
   *
   * @param partial - The update to merge, or a function that produces one.
   */
  setState(partial: StateUpdater<T>): void

  /**
   * Registers a listener that is called whenever the state changes.
   *
   * The listener receives both the **new** state and the **previous** state,
   * which is useful for diffing or running side effects.
   *
   * Returns an **unsubscribe** function — call it to stop listening.
   *
   * @param listener - Called with `(newState, previousState)` after every `setState`.
   * @returns A cleanup function that removes this listener when called.
   *
   * @example
   * ```ts
   * const unsubscribe = store.subscribe((next, prev) => {
   *   if (next.step !== prev.step) console.log('step changed!')
   * })
   *
   * // Later — stop listening
   * unsubscribe()
   * ```
   */
  subscribe(listener: (state: T, previousState: T) => void): () => void
}
