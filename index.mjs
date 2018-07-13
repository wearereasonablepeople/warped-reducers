//. # Warped Reducers
//.
//. [![Build Status](https://travis-ci.com/wearereasonablepeople/warped-reducers.svg?branch=master)](https://travis-ci.com/wearereasonablepeople/warped-reducers)
//.
//. Compile a standard Redux reducer from a brief definition.
//.
//. Usage in Node depends on `--experimental-modules`.
//. With older Node versions, use [`esm`][1].

// createType :: (String, String) -> String
export function createType(namespace, actionName) {
  return 'Warped/' + namespace + '/' + actionName;
}

// compileActionTypes :: (String, StrMap Any) -> StrMap String
export function compileActionTypes(namespace, actions) {
  var actionTypes = Object.create (null);
  Object.keys (actions).forEach (key => {
    actionTypes[key] = createType (namespace, key);
  });
  return actionTypes;
}

// compileActionTypes :: StrMap String
//                    -> StrMap (a -> { type :: String, payload :: a })
export function compileActionCreators(types) {
  const creators = Object.create (null);
  Object.entries (types).forEach (function(entry) {
    creators[entry[0]] = function(payload) {
      return {type: entry[1], payload: payload};
    };
  });
  return creators;
}

// compileReducer :: (String, StrMap b -> a -> a) -> (a, b) -> a
export function compileReducer(namespace, actions) {
  const handlers = Object.create (null);
  Object.entries (actions).forEach (function(entry) {
    handlers[createType (namespace, entry[0])] = entry[1];
  });
  return function(state, action) {
    return handlers[action.type] ?
           handlers[action.type] (action.payload) (state) :
           state;
  };
}

//. ## API
//.
//. ### Reducer Creation
//.
//# createReducer :: String -> StrMap (b -> a -> a) -> { types :: StrMap String, actions :: StrMap (b -> { type :: String, payload :: b }), reducer :: (a, b) -> a }
//.
//. This is also the default export from this module.
//.
//. Given a String representing the namespace, and a StrMap of action handlers,
//. returns a Record containing a single reducer, and a new StrMap mapping the
//. original keys to canonical identifiers of the types that the reducer can
//. handle.
//.
//. An action handler is a curried function that takes the payload of the
//. action first, and the state second, and should return a new state.
//. We recommend usings Optics, such as the `lens`-related functions from
//. [Ramda][2], to define the reducers - the signature of action handlers
//. is designed to align perfectly with the signature of functional utilities.
//.
//. ```js
//. const setMyProp = myProp => state => Object.assign ({}, state, {myProp});
//. createReducer ('MyNamespace') ({setMyProp});
//. ```
export default createReducer;
export function createReducer(namespace) {
  return function(actions) {
    var types = compileActionTypes (namespace, actions);
    return {
      types: types,
      actions: compileActionCreators (types),
      reducer: compileReducer (namespace, actions)
    };
  };
}

//# noopAction :: a -> b -> b
//.
//. A conviently named function that does nothing to your state.
//.
//. To be used when you need to define an action type which should not affect
//. the state, but can be used as a message to your Redux side-effect handling
//. middleware.
//.
//. ```js
//. > noopAction ({do: 'nothing'}) ({myState: 'whatever'})
//. {myState: 'whatever'}
//. ```
export function noopAction(payload) {
  return function(state) {
    return state;
  };
}

//. ### Redux Utilities
//.
//. In most cases you'll use this library in conjunction with [React Redux][3]
//. or [Redux][4], so we expose some basic utilities to ease this interaction.
//.
//# compileSelectors :: StrMap ((a, b) -> c) -> (a, b) -> StrMap c
//.
//. Given a mapping of selectors, returns a `mapStateToProps` function, as
//. accepted by `connect` from React Redux.
//.
//. The selectors are given the state (and previous props), and are expected
//. to return a slice of the state. We recommend usings Optics, such as the
//. `lens`-related functions from [Ramda][2], to create the selectors.
export function compileSelectors(selectors) {
  return function mapStateToProps(state, prevProps) {
    const props = Object.create (null);
    Object.entries (selectors).forEach (function(entry) {
      props[entry[0]] = entry[1] (state, prevProps);
    });
    return props;
  };
}

//# compileDispatchers :: StrMap (a -> b) -> (b -> c) -> StrMap (a -> c)
//.
//. Given a mapping of action creators, as returned from
//. [createReducer](#createReducer), returns a `mapDispatchToProps` function,
//. as accepted by `connect` from React Redux.
export function compileDispatchers(actions) {
  return function mapDispatchToProps(dispatch) {
    const props = Object.create (null);
    Object.entries (actions).forEach (function(entry) {
      props[entry[0]] = function dispatchAction(payload) {
        return dispatch (entry[1] (payload));
      };
    });
    return props;
  };
}

//# combineReducers :: Array ((a, b) -> a) -> (a, b) -> a
//.
//. Given an array of reducers, returns a single reducer which transforms the
//. state by calling all reducers in sequence.
export function combineReducers(reducers) {
  return function rootReducer(rootState, action) {
    return reducers.reduce (function reduceReducers(state, reducer) {
      return reducer (state, action);
    }, rootState);
  };
}

//. [1]: https://github.com/standard-things/esm
//. [2]: http://ramdajs.com/
//. [3]: https://github.com/reactjs/react-redux
//. [4]: http://redux.js.org/
