# Warped Reducers

[![Build Status](https://travis-ci.com/wearereasonablepeople/warped-reducers.svg?branch=master)](https://travis-ci.com/wearereasonablepeople/warped-reducers)

Compile a standard Redux reducer from a brief definition.

Works nicely with [Warped Components][1].

Usage in Node depends on `--experimental-modules`.
With older Node versions, use [std/esm][2].

## API

#### <a name="createReducer" href="https://github.com/wearereasonablepeople/warped-reducers/blob/v1.0.0/index.mjs#L53">`createReducer :: String -⁠> StrMap (b -⁠> a -⁠> a) -⁠> { types :: StrMap String, actions :: StrMap (b -⁠> { type :: String, payload :: b }), reducer :: (a, b) -⁠> a }`</a>

Given a String representing the namespace, and a StrMap of curried and
flipped reducers, returns a Record containing a single reducer, and a new
StrMap mapping the original keys to canonical identifiers of the types that
the reducer can handle.

This is the default export from this module.

```js
const setMyProp = myProp => state => Object.assign ({}, state, {myProp});
createReducer ('MyNamespace') ({setMyProp});
```

#### <a name="noopAction" href="https://github.com/wearereasonablepeople/warped-reducers/blob/v1.0.0/index.mjs#L78">`noopAction :: a -⁠> b -⁠> b`</a>

A conviently named function that does nothing to your state.

To be used when you need to define an action type which should not affect
the state, but can be used as a message to your Redux side-effect handling
middleware.

```js
> noopAction ({do: 'nothing'}) ({myState: 'whatever'})
{myState: 'whatever'}
```

[1]: https://github.com/wearereasonablepeople/warped-components
[2]: https://github.com/standard-things/esm
