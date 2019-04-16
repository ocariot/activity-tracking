import { Entity } from './entity'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * Implementation of the institution entity.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<Institution>}
 */
export class Institution extends Entity implements IJSONSerializable, IJSONDeserializable<Institution> {

    constructor() {
        super()
    }

    public fromJSON(json: any): Institution {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id
        }
    }
}
