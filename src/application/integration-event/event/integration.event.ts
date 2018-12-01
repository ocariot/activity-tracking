import { ISerializable } from '../../domain/utils/serializable.interface'

export abstract class IntegrationEvent<T> implements ISerializable<T> {

    protected constructor(readonly event_name: string, readonly timestamp?: Date) {
    }

    public serialize(): any {
        throw new Error('Not implemented!')
    }

    public deserialize(item: any): T {
        throw new Error('Not implemented!')
    }
}
