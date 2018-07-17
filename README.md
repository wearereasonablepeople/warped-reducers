# Warped Reducers

[![Build Status](https://travis-ci.com/wearereasonablepeople/warped-reducers.svg?branch=master)](https://travis-ci.com/wearereasonablepeople/warped-reducers)

Compile a standard Redux reducer from a brief definition.

Usage in Node depends on `--experimental-modules`.
With older Node versions, use [`esm`][1].

## API

#### <a name="createReducer" href="https://github.com/wearereasonablepeople/warped-reducers/blob/v1.0.2/index.mjs#L51">`createReducer :: String -⁠> StrMap (b -⁠> a -⁠> a) -⁠> { types :: StrMap String, actions :: StrMap (b -⁠> { type :: String, payload :: b }), reducer :: (a, b) -⁠> a }`</a>

This is also the default export from this module.

Given a String representing the namespace, and a StrMap of action handlers,
returns a Record containing a single reducer, and a new StrMap mapping the
original keys to canonical identifiers of the types that the reducer can
handle.

An action handler is a curried function that takes the payload of the
action first, and the state second, and should return a new state.
We recommend usings Optics, such as the `lens`-related functions from
[Ramda][2], to define the reducers - the signature of action handlers
is designed to align perfectly with the signature of functional utilities.

```js
const setMyProp = myProp => state => Object.assign ({}, state, {myProp});
createReducer ('MyNamespace') ({setMyProp});
```

#### <a name="noopAction" href="https://github.com/wearereasonablepeople/warped-reducers/blob/v1.0.2/index.mjs#L82">`noopAction :: a -⁠> b -⁠> b`</a>

A conviently named function that does nothing to your state.

To be used when you need to define an action type which should not affect
the state, but can be used as a message to your Redux side-effect handling
middleware.

```js
> noopAction ({do: 'nothing'}) ({myState: 'whatever'})
{myState: 'whatever'}
```

[1]: https://github.com/standard-things/esm
[2]: http://ramdajs.com/
