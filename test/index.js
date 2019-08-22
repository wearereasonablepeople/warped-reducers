import assert from 'assert';
import show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import {
  compileActionCreators,
  compileActionTypes,
  compileReducer,
  createReducer,
  createType,
  getTypes,
  getActions,
  noopAction
} from '..';


function eq(actual) {
  return function eqq(expected) {
    assert.strictEqual (show (actual), show (expected));
    assert.strictEqual (Z.equals (actual, expected), true);
  };
}

function mockHandler(payload) {
  return function(state) {
    return Object.assign ({}, state, {actionPayload: payload});
  };
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
  eq (typeof result.handlers) ('object');
  eq (result.reducer ({}, {type: 'Warped/Test/foo', payload: 'test'}))
     ({actionPayload: 'test'});
  eq (result.handlers.foo.type) ('Warped/Test/foo');
});

test ('getTypes', function() {
  var reducerReturn = createReducer ('Test') ({foo: mockHandler});
  var result = getTypes (reducerReturn.handlers);
  eq (typeof result) ('object');
  eq (result.foo) ('Warped/Test/foo');
});

test ('getActions', function() {
  var reducerReturn = createReducer ('Test') ({foo: mockHandler});
  var result = getActions (reducerReturn.handlers);
  eq (typeof result) ('object');
  eq (typeof result.foo) ('function');
  eq (result.foo ('test')) ({type: 'Warped/Test/foo', payload: 'test'});
});

test ('noopAction', function() {
  eq (noopAction (null) ({foo: 'bar'})) ({foo: 'bar'});
});
