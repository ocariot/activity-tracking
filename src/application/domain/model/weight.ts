import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { DatetimeValidator } from '../validator/datetime.validator'
import { Measurement, MeasurementType } from './measurement'
import { Fat } from './fat'

/**
 * Entity implementation for weight measurements.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<Weight>}
 */
export class Weight extends Measurement implements IJSONSerializable, IJSONDeserializable<Weight> {
    private _fat?: Fat // Object of body fat measurement associated with the weight measurement.

    constructor() {
        super()
        this.type = MeasurementType.WEIGHT
    }

    get fat(): Fat | undefined {
        return this._fat
    }

    set fat(value: Fat | undefined) {
        this._fat = value
    }

    public convertDatetimeString(value: string): Date {
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): Weight {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.timestamp !== undefined) this.timestamp = this.convertDatetimeString(json.timestamp)
        if (json.value !== undefined) this.value = json.value
        if (json.unit !== undefined) this.unit = json.unit
        if (json.child_id !== undefined) this.child_id = json.child_id
        if (json.fat !== undefined) {
            this.fat = new Fat().fromJSON(json)
            this.fat.value = json.fat
        }

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id,
            fat: this.fat
        }
    }
}
