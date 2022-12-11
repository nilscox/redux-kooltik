# API reference

## Types

An action is an object with a `type` field of type string, with any arbitrary extra properties. A payload
action is an action with a payload field.

```ts
type Action<Extra> = { type: string } & Extra;
type PayloadAction<Payload, Extra> = Action<Extra> & { payload: Payload };
```

An action creator is a function returning an action. An action creator accepting a parameter will return a
payload action.

```ts
interface ActionCreator<Extra> {
  (): Action<Extra>;
  type: string;
}

interface PayloadActionCreator<Payload, Extra, TransformedPayload = Payload> {
  (payload: Payload): PayloadAction<TransformedPayload, Extra>;
  type: string;
}
```

An action creator with an entity's id as first parameter.

```ts
type EntityActionCreator = (id: string) => Action<{ entityId: string }>;

type PayloadEntityActionCreator<Payload, TransformedPayload = Payload> = (
  id: string,
  payload: Payload
) => PayloadAction<TransformedPayload, { entityId: string }>;
```

An immer reducer is a reducer function, it can either return the new state, or mutate the state given as
parameter.

```ts
interface ImmerReducer<State, This> {
  (this: This, state: State): void | State;
}

interface PayloadImmerReducer<State, Payload, This> {
  (this: This, state: State, payload: Payload): void | State;
}
```

A selector is a function used to compute a derived state from a base state.

```ts
interface Selector<State, Params extends unknown[], Result> {
  (state: State, ...params: Params): Result;
}
```

## `class Actions<State>`

The `Actions` class can be extended to easily create action creators. All the methods are protected.

### `action`

The `action` method allows to create an action creator and its associated reducer.

```ts
action<Extra>(
  type: string,
  reducer: ImmerReducer<State, Action<Extra>>,
): ActionCreator<Extra>
```

```ts
action<Payload, Extra>(
  type: string,
  reducer: PayloadImmerReducer<State, Payload, PayloadAction<Payload, Extra>>,
): PayloadActionCreator<Payload, Extra>
```

```ts
action<Payload, TransformedPayload, Extra>(
  type: string,
  transformer: (this: Extra, payload: Payload) => TransformedPayload,
  reducer: PayloadImmerReducer<State, TransformedPayload, PayloadAction<Payload, Extra>>,
): PayloadActionCreator<Payload, TransformedPayload, Extra>
```

### `propertyAction`

The `propertyAction` method allow to create an action creator and its associated reducer on a given property
of the state.

```ts
propertyAction<Property extends keyof State>(
  property: Property,
  type: string,
  reducer: ImmerReducer<State[Property]>
): ActionCreator
```

```ts
propertyAction<Property extends keyof State, Payload>(
  property: Property,
  type: string,
  reducer: PayloadImmerReducer<State[Property], Payload>
): PayloadActionCreator<Payload>
```

### `set`

Create an action that will replace the whole state.

```ts
set(type = 'set'): PayloadActionCreator<State, State>
```

### `setProperty`

Create an action that will replace a single property of the state.

```ts
setProperty<Property extends keyof State>(property: Property, type = `set-${property}`)
```

### `subscribe`

Subscribe to an action, allowing to update the state from an action declared in another Actions class.

```ts
subscribe(
  actionCreator: ActionCreator,
  reducer: ImmerReducer<State>,
): void;
```

```ts
subscribe<Payload>(
  actionCreator: PayloadActionCreator<Payload>,
  reducer: PayloadImmerReducer<State, Partial<Payload>>
): void;
```

### `reducer`

Retrieve the reducer generated with the action. This method must be called after all action creators were
registered.

```ts
reducer(): Reducer<State>
```

## class `EntityActions<Entity, ExtraProperties>`

This class allows to store a collection of entities, by using a `Record<EntityId, Entity>`. This is useful to
handle normalized entities.

### `entityAction`

Like `action`, this method allows to create an action on a single entity of the collection. The returned
action creator will take the entity id as first parameter.

```ts
entityAction(
  type: string,
  reducer: ImmerReducer<Entity>
): EntityActionCreator

entityAction<Payload>(
  type: string,
  reducer: PayloadImmerReducer<Entity, Payload>
): PayloadEntityActionCreator<Payload>

entityAction<Payload, TransformedPayload>(
  type: string,
  transformer: (payload: Payload) => TransformedPayload,
  reducer: PayloadImmerReducer<Entity, TransformedPayload>
): PayloadEntityActionCreator<Payload, TransformedPayload>
```

### `setEntityProperty`

Create a setter for a single entity's property.

```ts
setEntityProperty<Property extends keyof Entity>(
  property: Property,
  type = `set-${property}`
): PayloadEntityActionCreator<Entity[Property]>
```

### `setEntitiesProperty`

Create a setter for a property on all entities.

```ts
setEntitiesProperty<Property extends keyof Entity>(
  property: Property,
  type = `set-all-${property}`
): PayloadActionCreator<Entity[Property]> {
```
