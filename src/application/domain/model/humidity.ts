import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Measurement, MeasurementType } from './measurement'

/**
 * Implementation of the Humidity entity.
 *
 * @implements { IJSONSerializable, IJSONDeserializable<Humidity>
 */
export class Humidity extends Measurement implements IJSONSerializable, IJSONDeserializable<Humidity> {

    constructor() {
        super()
        this.type = MeasurementType.HUMIDITY
    }

    public fromJSON(json: any): Humidity {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.value !== undefined) this.value = json.value
        if (json.unit !== undefined) this.unit = json.unit

        return this
    }

    public toJSON(): any {
        return {
            type: this.type,
            value: this.value,
            unit: this.unit,
        }
    }
}
