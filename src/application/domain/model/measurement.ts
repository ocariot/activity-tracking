import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Entity } from './entity'
import { DatetimeValidator } from '../validator/datetime.validator'

/**
 * Implementation of the measurement entity.
 *
 * @implements { IJSONSerializable, IJSONDeserializable<Measurement>
 */
export class Measurement extends Entity implements IJSONSerializable, IJSONDeserializable<Measurement> {
    private _type?: string // Type of measurement.
    private _timestamp?: Date // Timestamp according to the UTC.
    private _value?: number // Value of measurement.
    private _unit?: string // Unit of measurement.
    private _child_id?: string // Id of child associated with the measurement.

    constructor(type?: string, value?: number, unit?: string, timestamp?: Date, child_id?: string) {
        super()
        if (type) this.type = type
        if (value) this.value = value
        if (unit) this.unit = unit
        if (timestamp) this.timestamp = timestamp
        if (child_id) this.child_id = child_id
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        if (value !== undefined) this._type = value.toLowerCase().trim()
    }

    get timestamp(): Date | undefined {
        return this._timestamp
    }

    set timestamp(value: Date | undefined) {
        this._timestamp = value
    }

    get value(): number | undefined {
        return this._value
    }

    set value(value: number | undefined) {
        this._value = value
    }

    get unit(): string | undefined {
        return this._unit
    }

    set unit(value: string | undefined) {
        this._unit = value
    }

    get child_id(): string | undefined {
        return this._child_id
    }

    set child_id(value: string | undefined) {
        this._child_id = value
    }

    public convertDatetimeString(value: string): Date {
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): Measurement {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.timestamp !== undefined) this.timestamp = this.convertDatetimeString(json.timestamp)
        if (json.value !== undefined) this.value = json.value
        if (json.unit !== undefined) this.unit = json.unit
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            type: this.type,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id
        }
    }
}

/**
 * Name of traceable sleep stages.
 */
export enum MeasurementType {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity',
    FAT = 'fat',
    WEIGHT = 'weight'
}
