import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * Implementation of the measurement entity.
 *
 * @implements { IJSONSerializable, IJSONDeserializable<Measurement>
 */
export class Measurement implements IJSONSerializable, IJSONDeserializable<Measurement> {
    private _type!: string // Type of measurement.
    private _value!: number // Value of measurement.
    private _unit!: string // Unit of measurement.

    constructor(type?: string, value?: number, unit?: string) {
        if (type) this.type = type
        if (value) this.value = value
        if (unit) this.unit = unit
    }

    get type(): string {
        return this._type
    }

    set type(value: string) {
        this._type = value.toLowerCase().trim()
    }

    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
    }

    get unit(): string {
        return this._unit
    }

    set unit(value: string) {
        this._unit = value
    }

    public fromJSON(json: any): Measurement {
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
            unit: this.unit
        }
    }
}

/**
 * Name of traceable sleep stages.
 */
export enum MeasurementType {
    TEMPERATURE = 'temperature',
    HUMIDITY = 'humidity',
    HEART_RATE = 'heartrate',
    BODY_MASS = 'bodymass'
}
