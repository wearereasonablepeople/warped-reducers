//. # Warped Reducers
//.
//. [![Build Status](https://travis-ci.com/wearereasonablepeople/warped-reducers.svg?branch=master)](https://travis-ci.com/wearereasonablepeople/warped-reducers)
//. [![Greenkeeper Enabled](https://badges.greenkeeper.io/wearereasonablepeople/warped-reducers.svg)](https://greenkeeper.io/)
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
  Object.keys (actions).forEach (function(key) {
    actionTypes[key] = createType (namespace, key);
  });
  return actionTypes;
}

function createActionCreator(type) {
  return function(payload) {
    return {type: type, payload: payload};
  };
}

// compileActionTypes :: StrMap String
//                    -> StrMap (a -> { type :: String, payload :: a })
export function compileActionCreators(types) {
  var creators = Object.create (null);
  Object.entries (types).forEach (function(entry) {
    creators[entry[0]] = createActionCreator (entry[1]);
  });
  return creators;
}

// compileReducer :: (String, StrMap b -> a -> a) -> (a, b) -> a
export function compileReducer(namespace, actions) {
  var handlers = Object.create (null);
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
//# createReducer :: String -> StrMap (b -> a -> a) -> { handlers :: StrMap { type :: String, action :: (b -> { type :: String, payload :: b })}, reducer :: (a, b) -> a }
//.
//. This is also the default export from this module.
//.
//. Given a String representing the namespace, and a StrMap of action handlers,
//. returns a Record containing a single reducer, and a new StrMap mapping the
//. original keys to canonical identifiers of the types that the reducer can
//. handle along with action creator functions that build [flux standard action
//. objects][2] for those actions.
//.
//. An action handler is a curried function that takes the payload of the
//. action first, and the state second, and should return a new state.
//. We recommend usings Optics, such as the `lens`-related functions from
//. [Ramda][3], to define the reducers - the signature of action handlers
//. is designed to align perfectly with the signature of functional utilities.
//.
//. ```js
//. const setMyProp = myProp => state => Object.assign ({}, state, {myProp});
//. createReducer ('MyNamespace') ({setMyProp});
//. ```
export default createReducer;
export function createReducer(namespace) {
  return function(actions) {
    var handlers = Object.create (null);
    Object.entries (actions).forEach (function(entry) {
      var type = createType (namespace, entry[0]);
      handlers[entry[0]] = {
        type: type,
        action: createActionCreator (type)
      };
    });
    return {
      handlers: handlers,
      reducer: compileReducer (namespace, actions)
    };
  };
}

//# getActions :: StrMap { action :: a } -> Array a
//.
//. Extracts action creators from a handlers object as returned from
//. createReducer
//.
export function getActions(handlers) {
  var actions = Object.create (null);
  Object.entries (handlers).forEach (function(entry) {
    return actions[entry[0]] = entry[1].action;
  });
  return actions;
}


//# getTypes :: StrMap { type :: String } -> Array String
//.
//. Extracts types from a handlers object
//.
export function getTypes(handlers) {
  var types = Object.create (null);
  Object.entries (handlers).forEach (function(entry) {
    return types[entry[0]] = entry[1].type;
  });
  return types;
}

//# noopAction :: a -> b -> b
//.
//. A conveniently named function that does nothing to your state.
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

//. [1]: https://github.com/standard-things/esm
//. [2]: https://github.com/redux-utilities/flux-standard-action
//. [3]: http://ramdajs.com/
