import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { DatetimeValidator } from '../validator/datetime.validator'
import { Measurement, MeasurementType } from './measurement'

/**
 * Entity implementation for body fat measurements.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<Fat>}
 */
export class Fat extends Measurement implements IJSONSerializable, IJSONDeserializable<Fat> {

    constructor() {
        super()
        this.type = MeasurementType.FAT
        this.unit = '%'
    }

    public convertDatetimeString(value: string): Date {
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): Fat {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.timestamp !== undefined) this.timestamp = this.convertDatetimeString(json.timestamp)
        if (json.value !== undefined) this.value = json.value
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id
        }
    }
}
