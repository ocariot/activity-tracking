import { Entity } from './entity'
import { ISerializable } from '../utils/serializable.interface'

/**
 * Implementation of the user entity.
 *
 * @extends {Entity}
 * @implements {ISerializable<User>}
 */
export class User extends Entity implements ISerializable<User> {
    constructor(id?: string) {
        super(id)
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            id: super.getId()
        }
    }

    /**
     * Transform JSON into User object.
     *
     * @param json
     */
    public deserialize(json: any): User {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.id) this.setId(json.id)

        return this
    }
}
