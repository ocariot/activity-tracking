import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * The implementation of the data set entity present in the sleep pattern.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<SleepPatternDataSet>}
 */
export class SleepPatternDataSet implements IJSONSerializable, IJSONDeserializable<SleepPatternDataSet> {
    private _start_time!: Date // Date and time of the start of the pattern according to the UTC.
    private _name!: string // Sleep pattern name (awake, asleep or restless).
    private _duration!: number // Total in milliseconds of the time spent on the pattern.

    constructor(start_time?: Date, name?: string, duration?: number) {
        if (start_time) this._start_time = start_time
        if (name) this._name = name
        if (duration) this._duration = duration
    }

    get start_time(): Date {
        return this._start_time
    }

    set start_time(value: Date) {
        this._start_time = value
    }

    get name(): string {
        return this._name
    }

    set name(value: string) {
        this._name = value
    }

    get duration(): number {
        return this._duration
    }

    set duration(value: number) {
        this._duration = value
    }

    public fromJSON(json: any): SleepPatternDataSet {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.start_time !== undefined) this.start_time = new Date(json.start_time)
        if (json.name !== undefined) this.name = json.name
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            start_time: this.start_time,
            name: this.name,
            duration: this.duration
        }
    }
}
