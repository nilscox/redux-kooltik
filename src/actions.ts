import produce from 'immer';
import { Reducer } from 'redux';

export type Action = { type: string };
export type PayloadAction<Payload, Extra = unknown> = Action & { payload: Payload } & Extra;

export interface ActionCreator<Payload, TransformedPayload = Payload, Extra = unknown> {
  (payload: Payload): PayloadAction<TransformedPayload, Extra>;
  type: string;
}

export interface ImmerReducer<State, Payload, This = unknown> {
  (this: This, state: State, payload: Payload): void | State;
}

export interface Selector<State, Params extends unknown[], Result> {
  (state: State, ...params: Params): Result;
}

export class Actions<State> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private actions = new Map<string, ImmerReducer<State, any>>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subscriptions = new Map<string, ImmerReducer<State, any>>();

  constructor(public readonly name: string, private readonly initialState: State) {}

  private actionType(type: string) {
    return `${this.name}/${type}`;
  }

  protected action<Payload, Extra = unknown>(
    type: string,
    reducer: ImmerReducer<State, Payload, PayloadAction<Payload, Extra>>
  ): ActionCreator<Payload, Payload, Extra>;

  protected action<Payload, TransformedPayload, Extra = unknown>(
    type: string,
    transformer: (this: Extra, payload: Payload) => TransformedPayload,
    reducer: ImmerReducer<State, TransformedPayload, PayloadAction<Payload, Extra>>
  ): ActionCreator<Payload, TransformedPayload, Extra>;

  protected action(type: string, arg1: unknown, arg2?: unknown) {
    const [reducer, transformer] =
      arg2 === undefined
        ? [arg1 as ImmerReducer<State, unknown>, (payload: unknown) => payload]
        : [arg2 as ImmerReducer<State, unknown>, arg1 as (payload: unknown) => unknown];

    const actionType = this.actionType(type);

    if (this.actions.has(actionType)) {
      throw new Error(`action "${actionType}" already exists`);
    }

    this.actions.set(actionType, reducer);

    const actionCreator: ActionCreator<unknown> = (payload) => {
      const extra = {};
      const transformedPayload = transformer.call(extra, payload);

      return {
        type: actionType,
        payload: transformedPayload,
        ...extra,
      };
    };

    actionCreator.type = actionType;

    return actionCreator;
  }

  protected setState(type = 'set') {
    return this.action(type, (_, value: State) => value);
  }

  protected createSetter<Property extends keyof State>(property: Property, type = `set-${String(property)}`) {
    return this.action(type, (state: State, value: State[Property]) => {
      state[property] = value;
    });
  }

  protected subscribe<Payload>(
    actionCreator: ActionCreator<Payload>,
    reducer: ImmerReducer<State, Partial<Payload>>
  ) {
    if (this.subscriptions.has(actionCreator.type)) {
      throw new Error(`subscription to "${actionCreator.type}" already exists in actions "${this.name}"`);
    }

    this.subscriptions.set(actionCreator.type, reducer);
  }

  reducer(): Reducer<State> {
    return (state = this.initialState, action) => {
      const subscription = this.subscriptions.get(action.type);
      const reducer = this.actions.get(action.type);

      if (subscription) {
        state = produce(state, (state: State) => subscription(state, action.payload));
      }

      if (reducer) {
        state = produce(state, (state: State) => reducer.call(action, state, action.payload));
      }

      return state;
    };
  }
}
