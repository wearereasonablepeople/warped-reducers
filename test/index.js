import assert from 'assert';
import show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import {
  combineReducers,
  compileActionCreators,
  compileActionTypes,
  compileDispatchers,
  compileReducer,
  compileSelectors,
  createReducer,
  createType,
  noopAction
} from '..';


function eq(actual) {
  return function eqq(expected) {
    assert.strictEqual (show (actual), show (expected));
    assert.strictEqual (Z.equals (actual, expected), true);
  };
}

function mockAction(payload) {
  return {type: 'MOCK', payload: payload};
}

function mockDispatch(payload) {
  return {dispatched: payload};
}

function mockHandler(payload) {
  return function(state) {
    return Object.assign ({}, state, {actionPayload: payload});
  };
}

function mockReducer(state, action) {
  return Object.assign ({}, state, {lastAction: action.type});
}

function mockReducerCount(state, action) {
  return action.type === 'MOCK' ?
         Object.assign ({}, state, {count: state.count + 1}) :
         state;
}

function mockSelector(state) {
  return String (state.count);
}

test ('createType', function() {
  eq (createType ('Test', 'foo'))
     ('Warped/Test/foo');
});

test ('compileActionTypes', function() {
  eq (compileActionTypes ('Test', {})) ({});
  eq (compileActionTypes ('Test', {foo: mockHandler, bar: mockHandler}))
     ({foo: 'Warped/Test/foo', bar: 'Warped/Test/bar'});
});

test ('compileReducer', function() {
  var reducer = compileReducer ('Test', {foo: mockHandler});
  eq (typeof reducer) ('function');
  eq (reducer.length) (2);
  eq (reducer ({}, {type: 'NotHandled'})) ({});
  eq (reducer ({}, {type: 'Warped/Test/foo', payload: 'test'}))
     ({actionPayload: 'test'});
});

test ('compileActionCreators', function() {
  const creators = compileActionCreators ({foo: 'Warped/Foo'});
  eq (typeof creators) ('object');
  eq (typeof creators.foo) ('function');
  eq (creators.foo ('test')) ({type: 'Warped/Foo', payload: 'test'});
});

test ('createReducer', function() {
  var result = createReducer ('Test') ({foo: mockHandler});
  eq (typeof result) ('object');
  eq (typeof result.reducer) ('function');
  eq (typeof result.types) ('object');
  eq (result.reducer ({}, {type: 'Warped/Test/foo', payload: 'test'}))
     ({actionPayload: 'test'});
  eq (result.types) ({foo: 'Warped/Test/foo'});
});

test ('noopAction', function() {
  eq (noopAction (null) ({foo: 'bar'})) ({foo: 'bar'});
});

test ('compileSelectors', function() {
  var mapState = compileSelectors ({test: mockSelector});
  eq (typeof mapState) ('function');
  eq (mapState ({count: 42})) ({test: '42'});
});

test ('compileDispatchers', function() {
  var mapDispatch = compileDispatchers ({test: mockAction});
  eq (typeof mapDispatch) ('function');
  var dispatchers = mapDispatch (mockDispatch);
  eq (typeof dispatchers) ('object');
  eq (typeof dispatchers.test) ('function');
  eq (dispatchers.test (42)) ({dispatched: {type: 'MOCK', payload: 42}});
});

test ('combineReducers', function() {
  var zeroReducers = combineReducers ([]);
  var oneReducer = combineReducers ([mockReducer]);
  var twoReducers = combineReducers ([mockReducer, mockReducerCount]);

  eq (zeroReducers ({}, mockAction (42))) ({});
  eq (oneReducer ({}, mockAction (42))) ({lastAction: 'MOCK'});
  eq (twoReducers ({count: 1}, mockAction (42)))
     ({lastAction: 'MOCK', count: 2});
});
