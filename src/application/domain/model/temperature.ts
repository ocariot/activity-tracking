import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Measurement, MeasurementType } from './measurement'

/**
 * Implementation of the Temperature entity.
 *
 * @implements { IJSONSerializable, IJSONDeserializable<Temperature>
 */
export class Temperature extends Measurement implements IJSONSerializable, IJSONDeserializable<Temperature> {

    constructor() {
        super()
        this.type = MeasurementType.TEMPERATURE
    }

    public fromJSON(json: any): Temperature {
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
