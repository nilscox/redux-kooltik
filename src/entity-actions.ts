import {
  PayloadImmerReducer,
  PayloadAction,
  Actions,
  ImmerReducer,
  Action,
  PayloadActionCreator,
} from './actions';
import { EntitiesState, EntityAdapter } from './entity-adapter';

type EntityActionCreator = (id: string) => Action<{ entityId: string }>;

type PayloadEntityActionCreator<Payload, TransformedPayload = Payload> = (
  id: string,
  payload: Payload
) => PayloadAction<TransformedPayload, { entityId: string }>;

export class EntityActions<Entity, ExtraProperties = undefined> extends Actions<
  EntitiesState<Entity, ExtraProperties extends undefined ? unknown : ExtraProperties>
> {
  constructor(
    name: string,
    ...[initialExtraProperties]: ExtraProperties extends undefined ? [] : [ExtraProperties]
  ) {
    type T = EntitiesState<Entity, ExtraProperties extends undefined ? unknown : ExtraProperties>;
    super(name, EntityAdapter.initialState(initialExtraProperties) as T);
  }

  protected entityAction(type: string, reducer: ImmerReducer<Entity>): EntityActionCreator;

  protected entityAction<Payload>(
    type: string,
    reducer: PayloadImmerReducer<Entity, Payload>
  ): PayloadEntityActionCreator<Payload>;

  protected entityAction<Payload, TransformedPayload>(
    type: string,
    transformer: (payload: Payload) => TransformedPayload,
    reducer: PayloadImmerReducer<Entity, TransformedPayload>
  ): PayloadEntityActionCreator<Payload, TransformedPayload>;

  protected entityAction(type: string, arg1: unknown, arg2?: unknown) {
    const [reducer, transformer] =
      arg2 === undefined
        ? [arg1 as PayloadImmerReducer<Entity, unknown>, (payload: unknown) => payload]
        : [arg2 as PayloadImmerReducer<Entity, unknown>, arg1 as (payload: unknown) => unknown];

    const actionsName = this.name;

    const action = this.action<unknown, unknown, { entityId: string }>(
      type,
      transformer,
      function ({ entities }, payload: unknown) {
        const { entityId } = this;
        const entity = entities[entityId];

        if (!entity) {
          console.warn(`EntityActions(${actionsName}).entityAction: entity with id "${entityId}" not found`);
          return;
        }

        const result = reducer(entity, payload);

        if (result) {
          entities[entityId] = result;
        }
      }
    );

    return (entityId: string, payload?: unknown) => {
      return { ...action(payload), entityId };
    };
  }

  protected setEntityProperty<Property extends keyof Entity>(
    property: Property,
    type = `set-${String(property)}`
  ): PayloadEntityActionCreator<Entity[Property]> {
    return this.entityAction(type, (entity: Entity, value: Entity[Property]) => {
      entity[property] = value;
    });
  }

  protected setEntitiesProperty<Property extends keyof Entity>(
    property: Property,
    type = `set-all-${String(property)}`
  ): PayloadActionCreator<Entity[Property]> {
    return this.action(type, (state: EntitiesState<Entity>, value: Entity[Property]) => {
      Object.values(state.entities).forEach((entity) => {
        entity[property] = value;
      });
    });
  }
}
