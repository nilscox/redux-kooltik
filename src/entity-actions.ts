import {
  Action,
  Actions,
  ImmerReducer,
  PayloadAction,
  PayloadActionCreator,
  PayloadImmerReducer,
} from './actions';
import { Entities } from './entity-adapter';

type EntityActionCreator = (id: string) => Action<{ entityId: string }>;

type PayloadEntityActionCreator<Payload, TransformedPayload = Payload> = (
  id: string,
  payload: Payload
) => PayloadAction<TransformedPayload, { entityId: string }>;

export type EntitiesState<Entity, ExtraProperties = undefined> = Entities<Entity> &
  (ExtraProperties extends undefined ? unknown : ExtraProperties);

export class EntityActions<Entity, ExtraProperties = undefined> extends Actions<
  EntitiesState<Entity, ExtraProperties>
> {
  constructor(
    name: string,
    ...[initialExtraProperties]: ExtraProperties extends undefined ? [] : [ExtraProperties]
  ) {
    super(name, { entities: {}, ...initialExtraProperties } as EntitiesState<Entity, ExtraProperties>);
  }

  entityAction(type: string, reducer: ImmerReducer<Entity>): EntityActionCreator;

  entityAction<Payload>(
    type: string,
    reducer: PayloadImmerReducer<Entity, Payload>
  ): PayloadEntityActionCreator<Payload>;

  entityAction<Payload, TransformedPayload>(
    type: string,
    transformer: (payload: Payload) => TransformedPayload,
    reducer: PayloadImmerReducer<Entity, TransformedPayload>
  ): PayloadEntityActionCreator<Payload, TransformedPayload>;

  entityAction(type: string, arg1: unknown, arg2?: unknown) {
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

  setEntityProperty<Property extends keyof Entity>(
    property: Property,
    type = `set-${String(property)}`
  ): PayloadEntityActionCreator<Entity[Property]> {
    return this.entityAction(type, (entity: Entity, value: Entity[Property]) => {
      entity[property] = value;
    });
  }

  setEntitiesProperty<Property extends keyof Entity>(
    property: Property,
    type = `set-all-${String(property)}`
  ): PayloadActionCreator<Entity[Property]> {
    return this.action(type, ({ entities }: EntitiesState<Entity>, value: Entity[Property]) => {
      Object.values(entities).forEach((entity) => {
        entity[property] = value;
      });
    });
  }
}
