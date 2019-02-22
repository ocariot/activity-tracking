import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * Entity implementation of the individual log of the PhysicalActivity.
 * 
 * @implements {IJSONSerializable, IJSONDeserializable<Log>}
 */
export class Log implements IJSONSerializable, IJSONDeserializable<Log> {
    private _date!: Date // Date of the log according to the format yyyy-MM-dd.
    private _value!: number // Total time in milliseconds spent in the day.

    constructor(date?: Date, value?: number) {
        if (date) this.date = date
        if (value) this.value = value
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

    public fromJSON(json: any): Log {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.date !== undefined) this.date = json.date
        if (json.value !== undefined) this.value = json.value

        return this
    }

    public toJSON(): any {
        return {
            date: this.date,
            value: this.value
        }
    }
}
