/**
 * Returns true if at least one key in the patch differs from the previous state.
 *
 * Uses `Object.is` for comparison — handles edge cases like NaN and ±0 correctly.
 *
 * @example
 * hasChanged({ count: 0 }, { count: 1 }, { count: 1 }) // true  — value changed
 * hasChanged({ count: 0 }, { count: 0 }, { count: 0 }) // false — same value, skip notify
 */
export function hasChanged<T extends object>(prev: T, patchedState: T, patch: Partial<T>): boolean {
  return Object.keys(patch).some((k) => !Object.is(prev[k as keyof T], patchedState[k as keyof T]))
}
