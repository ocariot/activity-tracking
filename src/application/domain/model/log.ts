import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Entity } from './entity'
import { DatelogValidator } from '../validator/datelog.validator'

/**
 * Entity implementation of the individual log of the PhysicalActivity.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Log>}
 */
export class Log extends Entity implements IJSONSerializable, IJSONDeserializable<Log> {
    private _date!: Date // Date of the log according to the format yyyy-MM-dd.
    private _value!: number // Total time in milliseconds spent in the day.
    private _type!: LogType // Log type
    private _child_id!: string // Child ID

    constructor(date?: Date, value?: number, type?: LogType, child_id?: string) {
        super()
        if (date) this.date = date
        if (value) this.value = value
        if (type) this.type = type
        if (child_id) this.child_id = child_id
    }

    get date(): Date {
        return this._date
    }

    set date(value: Date) {
        this._date = value
    }

    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
    }

    get type(): LogType {
        return this._type
    }

    set type(value: LogType) {
        this._type = value
    }

    get child_id(): string {
        return this._child_id
    }

    set child_id(value: string) {
        this._child_id = value
    }

    public convertDatetimeString(value: string): Date {
        DatelogValidator.validate(value)
        return new Date(value.concat('T00:00:00'))
    }

    public fromJSON(json: any): Log {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.date !== undefined) this.date = this.convertDatetimeString(json.date)
        if (json.value !== undefined) this.value = json.value
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            type: this.type,
            date: this.date,
            value: this.value,
            child_id: this.child_id
        }
    }
}

export enum LogType {
    STEPS = 'steps',
    CALORIES = 'calories'
}
