import { IJSONSerializable } from '../../domain/utils/json.serializable.interface'

export abstract class IntegrationEvent<T> implements IJSONSerializable {

    protected constructor(readonly event_name: string, readonly type: EventType, readonly timestamp?: Date) {
    }

    public toJSON(): any {
        throw new Error('Not implemented!')
    }
}

export enum EventType {
    PHYSICAL_ACTIVITIES = 'physicalactivities',
    SLEEP = 'sleep',
    ENVIRONMENTS = 'environments',
    USERS = 'users'
}
