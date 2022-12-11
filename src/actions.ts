import produce from 'immer';
import { Reducer } from 'redux';

export type Action<Extra = unknown> = { type: string } & Extra;
export type PayloadAction<Payload, Extra = unknown> = Action<Extra> & { payload: Payload };

export interface ActionCreator<Extra = unknown> {
  (): Action<Extra>;
  type: string;
}

export interface PayloadActionCreator<Payload, Extra = unknown, TransformedPayload = Payload> {
  (payload: Payload): PayloadAction<TransformedPayload, Extra>;
  type: string;
}

export interface ImmerReducer<State, This = unknown> {
  (this: This, state: State): void | State;
}

export interface PayloadImmerReducer<State, Payload, This = unknown> {
  (this: This, state: State, payload: Payload): void | State;
}

export interface Selector<State, Params extends unknown[], Result> {
  (state: State, ...params: Params): Result;
}

export class Actions<State> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private actions = new Map<string, PayloadImmerReducer<State, any>>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subscriptions = new Map<string, PayloadImmerReducer<State, any>>();

  constructor(protected readonly name: string, private readonly initialState: State) {}

  private actionType(type: string) {
    return `${this.name}/${type}`;
  }

  protected action<Extra = unknown>(
    type: string,
    reducer: ImmerReducer<State, Action<Extra>>
  ): ActionCreator<Extra>;

  protected action<Payload, Extra = unknown>(
    type: string,
    reducer: PayloadImmerReducer<State, Payload, PayloadAction<Payload, Extra>>
  ): PayloadActionCreator<Payload, Extra>;

  protected action<Payload, TransformedPayload, Extra = unknown>(
    type: string,
    transformer: (this: Extra, payload: Payload) => TransformedPayload,
    reducer: PayloadImmerReducer<State, TransformedPayload, PayloadAction<Payload, Extra>>
  ): PayloadActionCreator<Payload, Extra, TransformedPayload>;

  protected action(type: string, arg1: unknown, arg2?: unknown) {
    const [reducer, transformer] =
      arg2 === undefined
        ? [arg1 as PayloadImmerReducer<State, unknown>, (payload: unknown) => payload]
        : [arg2 as PayloadImmerReducer<State, unknown>, arg1 as (payload: unknown) => unknown];

    const actionType = this.actionType(type);

    if (this.actions.has(actionType)) {
      throw new Error(`action "${actionType}" already exists`);
    }

    this.actions.set(actionType, reducer);

    const actionCreator: PayloadActionCreator<unknown> = (payload) => {
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

  protected propertyAction<Property extends keyof State>(
    property: Property,
    type: string,
    reducer: ImmerReducer<State[Property]>
  ): ActionCreator;

  protected propertyAction<Property extends keyof State, Payload>(
    property: Property,
    type: string,
    reducer: PayloadImmerReducer<State[Property], Payload>
  ): PayloadActionCreator<Payload>;

  protected propertyAction<Property extends keyof State, Payload>(
    property: Property,
    type: string,
    reducer: ImmerReducer<State[Property]> | PayloadImmerReducer<State[Property], Payload>
  ): ActionCreator | PayloadActionCreator<Payload> {
    return this.action(type, (state: State, payload: Payload) => {
      const result = reducer(state[property], payload);

      if (result !== undefined) {
        state[property] = result;
      }
    });
  }

  protected set(type = 'set') {
    return this.action(type, (_state: State, value: State) => value);
  }

  protected setProperty<Property extends keyof State>(property: Property, type = `set-${String(property)}`) {
    return this.propertyAction(property, type, (_: State[Property], value: State[Property]) => value);
  }

  protected subscribe(actionCreator: ActionCreator, reducer: ImmerReducer<State>): void;

  protected subscribe<Payload>(
    actionCreator: PayloadActionCreator<Payload>,
    reducer: PayloadImmerReducer<State, Partial<Payload>>
  ): void;

  protected subscribe<Payload>(
    actionCreator: ActionCreator<Payload> | PayloadActionCreator<Payload>,
    reducer: ImmerReducer<State> | PayloadImmerReducer<State, Partial<Payload>>
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

      if (reducer) {
        state = produce(state, (state: State) => reducer.call(action, state, action.payload));
      }

      if (subscription) {
        state = produce(state, (state: State) => subscription(state, action.payload));
      }

      return state;
    };
  }
}
