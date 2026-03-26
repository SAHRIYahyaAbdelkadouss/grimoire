import { describe, it, expect } from 'vitest'
import { hasChanged } from '../src'

interface State {
  count: number
  name: string
  flag: boolean
}

describe('hasChanged', () => {
  // ── returns true when a value changed ────────────────────
  it('returns true when a patched key has a new value', () => {
    const prev: State = { count: 0, name: 'test', flag: false }
    const patched: State = { count: 1, name: 'test', flag: false }
    expect(hasChanged(prev, patched, { count: 1 })).toBe(true)
  })

  it('returns true when multiple keys changed', () => {
    const prev: State = { count: 0, name: 'test', flag: false }
    const patched: State = { count: 5, name: 'done', flag: false }
    expect(hasChanged(prev, patched, { count: 5, name: 'done' })).toBe(true)
  })

  it('returns true when at least one of many patched keys changed', () => {
    const prev: State = { count: 0, name: 'test', flag: false }
    const patched: State = { count: 0, name: 'changed', flag: false }
    expect(hasChanged(prev, patched, { count: 0, name: 'changed' })).toBe(true)
  })

  // ── returns false when nothing changed ───────────────────
  it('returns false when all patched keys have the same value', () => {
    const prev: State = { count: 0, name: 'test', flag: false }
    const patched: State = { count: 0, name: 'test', flag: false }
    expect(hasChanged(prev, patched, { count: 0 })).toBe(false)
  })

  it('returns false when patch is empty', () => {
    const prev: State = { count: 0, name: 'test', flag: false }
    expect(hasChanged(prev, prev, {})).toBe(false)
  })

  // ── Object.is edge cases ──────────────────────────────────
  it('treats NaN as equal to NaN (unlike ===)', () => {
    const prev = { value: NaN }
    const patched = { value: NaN }
    expect(hasChanged(prev, patched, { value: NaN })).toBe(false)
  })

  it('treats +0 and -0 as different (unlike ===)', () => {
    const prev = { value: +0 }
    const patched = { value: -0 }
    expect(hasChanged(prev, patched, { value: -0 })).toBe(true)
  })

  it('returns true when value changes from a number to undefined', () => {
    const prev = { count: 1 } as { count: number | undefined }
    const patched = { count: undefined }
    expect(hasChanged(prev, patched, { count: undefined })).toBe(true)
  })
})
