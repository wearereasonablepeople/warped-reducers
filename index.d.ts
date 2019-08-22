type StrMap<T> = Record<string, T>;
type Actions<S> = StrMap<ActionHandler<any, S>>;

export type ActionHandler<P, S> = (payload: P) => (state: S) => S;

export type StandardAction<P> = {type: string; payload: P};

export type Reducer<S, P> = (
  state: S,
  action: StandardAction<P>
) => S;

export type ActionCreator<P> = (payload: P) => StandardAction<P>;

export type Handler<T extends ActionHandler<any, any>> = {
  type: string;
  action: ActionCreator<ActionHandlerPayloadType<T>>;
}

/**
 * Utility to get the payload type of an ActionHandler
 */
export type ActionHandlerPayloadType<T extends ActionHandler<any, any>> =
  T extends ActionHandler<infer P, any> ? P : never;

/**
 * Utility to extract the possible payloads of the handlers object
 */
export type PayloadsOf<T extends StrMap<Handler<any>>> =
  T[keyof T]['action'] extends ActionCreator<infer P> ? P : never;

/**
 * Namespaces a set of actions into action types, action creators and
 * a reducer.
 *
 * See https://github.com/wearereasonablepeople/warped-reducers#createReducer
 */
export declare function createReducer<S>(namespace: string):
  <TActions extends Actions<S>>(actions: TActions) => {
    handlers: {
      [K in keyof TActions]: Handler<TActions[K]>;
    };
    reducer: Reducer<S, ActionHandlerPayloadType<TActions[keyof TActions]>>;
  };
export default createReducer;

/**
 * Extracts action creators from the handlers object as returned by createReducer
 * See https://github.com/wearereasonablepeople/warped-reducers#getActions
 */
export declare function getActions<T extends StrMap<{action: any}>>(handlers: T):
  {[K in keyof T]: T[K]['action']}

/**
 * Extracts action types from the handlers object as returned by createReducer
 * See https://github.com/wearereasonablepeople/warped-reducers#getActions
 */
export declare function getTypes<T extends StrMap<{type: any}>>(handlers: T):
  {[K in keyof T]: T[K]['type']}

/**
 * A conveniently named function that does nothing to your state.
 *
 * See https://github.com/wearereasonablepeople/warped-reducers#noopAction
 */
export declare var noopAction: (payload: any) => <T>(state: T) => T;
