import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Entity } from './entity'
import { DatetimeValidator } from '../validator/datetime.validator'
import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

/**
 * Implementation of the measurement entity.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Measurement>}
 */
export class Measurement extends Entity implements IJSONSerializable, IJSONDeserializable<Measurement> {
    private _type?: string // Type of measurement.
    private _timestamp?: Date // Timestamp according to the UTC.
    private _value?: number // Value of measurement.
    private _unit?: string // Unit of measurement.
    private _child_id?: string // Id of child associated with the measurement.

    constructor() {
        super()
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value && typeof value === 'string' ? value.toLowerCase().trim() : value
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
        const date: Date = new Date(value)
        if (isNaN(date.getTime())) {
            throw new ValidationException(`Datetime: ${value}`.concat(Strings.ERROR_MESSAGE.INVALID_DATE),
                Strings.ERROR_MESSAGE.INVALID_DATE_DESC)
        }
        return date
    }

    public fromJSON(json: any): Measurement {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.timestamp !== undefined && !(json.timestamp instanceof Date)) {
            this.timestamp = this.convertDatetimeString(json.timestamp)
        } else if (json.timestamp !== undefined && json.timestamp instanceof Date){
            this.timestamp = json.timestamp
        }
        if (json.value !== undefined) this.value = json.value
        if (json.unit !== undefined) this.unit = json.unit
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            type: this.type,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id
        }
    }
}

/**
 * Name of traceable measurements.
 */
export enum MeasurementType {
    BODY_FAT = 'body_fat',
    WEIGHT = 'weight'
}
