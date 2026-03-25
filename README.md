# grimoire-store

[![CI](https://github.com/SAHRIYahyaAbdelkadouss/grimoire/actions/workflows/ci.yml/badge.svg)](https://github.com/SAHRIYahyaAbdelkadouss/grimoire/actions)
[![npm](https://img.shields.io/npm/v/grimoire-store)](https://www.npmjs.com/package/grimoire-store)
[![License](https://img.shields.io/npm/l/grimoire-store)](./LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/grimoire-store)](https://bundlephobia.com/package/grimoire-store)

A tiny, zero-dependency state store for JavaScript and TypeScript.  
Skips notifying listeners when the value you set is already the same — no unnecessary re-renders.

## Install

```sh
npm install grimoire-store
```

## Usage

```ts
import { createGrimoire } from 'grimoire-store'

const store = createGrimoire({ count: 0, name: 'guest' })

// Read state
store.getState() // { count: 0, name: 'guest' }

// Merge a partial update
store.setState({ count: 1 })

// Update from previous state
store.setState((prev) => ({ count: prev.count + 1 }))

// Subscribe to changes
const unsubscribe = store.subscribe((state, prev) => {
  console.log('changed', state, prev)
})

// Stop listening
unsubscribe()
```

## API

### `createGrimoire(initialState)`

Creates a new store. Returns a `StoreApi<T>` object.

| Method      | Signature                                                  | Description                                                      |
| ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `getState`  | `() => T`                                                  | Returns the current state                                        |
| `setState`  | `(partial: Partial<T> \| (prev: T) => Partial<T>) => void` | Merges a patch into state. Skips notification if nothing changed |
| `subscribe` | `(listener: (state: T, prev: T) => void) => () => void`    | Registers a listener. Returns an unsubscribe function            |

## License

ISC © [SAHRI Yahya Abdelkadouss](https://github.com/SAHRIYahyaAbdelkadouss)
