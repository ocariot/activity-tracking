import { IJSONSerializable } from '../../domain/utils/json.serializable.interface'

export abstract class IntegrationEvent<T> implements IJSONSerializable {

    protected constructor(readonly event_name: string, readonly timestamp?: Date) {
    }

    public toJSON(): any {
        throw new Error('Not implemented!')
    }
}
