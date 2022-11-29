import { ImmerReducer, PayloadAction, Actions } from './actions';
import { EntitiesState, EntityAdapter } from './entity-adapter';

export class EntityActions<Entity, ExtraProperties = undefined> extends Actions<
  EntitiesState<Entity> & ExtraProperties
> {
  constructor(
    name: string,
    ...[initialExtraProperties]: ExtraProperties extends undefined ? [] : [ExtraProperties]
  ) {
    super(name, EntityAdapter.initialState(initialExtraProperties));
  }

  protected entityAction<Payload>(
    type: string,
    reducer: ImmerReducer<Entity, Payload>
  ): (entityId: string, payload: Payload) => PayloadAction<Payload, { entityId: string }>;

  protected entityAction<Payload, TransformedPayload>(
    type: string,
    transformer: (payload: Payload) => TransformedPayload,
    reducer: ImmerReducer<Entity, TransformedPayload>
  ): (entityId: string, payload: Payload) => PayloadAction<TransformedPayload, { entityId: string }>;

  protected entityAction(type: string, arg1: unknown, arg2?: unknown) {
    const [reducer, transformer] =
      arg2 === undefined
        ? [arg1 as ImmerReducer<Entity, unknown>, (payload: unknown) => payload]
        : [arg2 as ImmerReducer<Entity, unknown>, arg1 as (payload: unknown) => unknown];

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

    return (entityId: string, payload: unknown) => {
      return { ...action(payload), entityId };
    };
  }

  protected setEntityProperty<Property extends keyof Entity>(
    property: Property,
    type = `set-${String(property)}`
  ) {
    return this.entityAction(type, (entity, value: Entity[Property]) => {
      entity[property] = value;
    });
  }
}
