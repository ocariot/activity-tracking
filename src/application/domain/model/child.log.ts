import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Log } from './log'

/**
 * Entity implementation of the child logs.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Log>}
 */
export class ChildLog implements IJSONSerializable, IJSONDeserializable<ChildLog> {
    private _steps!: Array<Log> // Logs of steps of a child
    private _calories!: Array<Log> // Logs of calories of a child
    private _active_minutes!: Array<Log> // Logs of active minutes of a child
    private _sedentary_minutes!: Array<Log> // Logs of sedentary minutes of a child

    constructor(steps?: Array<Log>, calories?: Array<Log>, active_minutes?: Array<Log>, sedentary_minutes?: Array<Log>) {
        if (steps) this.steps = steps
        if (calories) this.calories = calories
        if (active_minutes) this.active_minutes = active_minutes
        if (sedentary_minutes) this.sedentary_minutes = sedentary_minutes
    }

    get steps(): Array<Log> {
        return this._steps
    }

    set steps(value: Array<Log>) {
        this._steps = value
    }

    get calories(): Array<Log> {
        return this._calories
    }

    set calories(value: Array<Log>) {
        this._calories = value
    }

    get active_minutes(): Array<Log> {
        return this._active_minutes
    }

    set active_minutes(value: Array<Log>) {
        this._active_minutes = value
    }

    get sedentary_minutes(): Array<Log> {
        return this._sedentary_minutes
    }

    set sedentary_minutes(value: Array<Log>) {
        this._sedentary_minutes = value
    }

    public fromJSON(json: any): ChildLog {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.steps !== undefined && json.steps instanceof Array) {
            this._steps = json.steps.map(steps => new Log().fromJSON(steps))
        }

        if (json.calories !== undefined && json.calories instanceof Array) {
            this._calories = json.calories.map(calories => new Log().fromJSON(calories))
        }

        if (json.active_minutes !== undefined && json.active_minutes instanceof Array) {
            this._active_minutes = json.active_minutes.map(activeMinutes => new Log().fromJSON(activeMinutes))
        }

        if (json.sedentary_minutes !== undefined && json.sedentary_minutes instanceof Array) {
            this._sedentary_minutes = json.sedentary_minutes.map(sedentaryMinutes => new Log().fromJSON(sedentaryMinutes))
        }

        return this
    }

    public toJSON(): any {
        return {
            steps: this._steps ? this._steps.map(item => item.toJSON()) : this._steps,
            calories: this._calories ? this._calories.map(item => item.toJSON()) : this._calories,
            active_minutes: this._active_minutes ? this._active_minutes.map(item => item.toJSON()) : this._active_minutes,
            sedentary_minutes: this._sedentary_minutes ? this._sedentary_minutes.map(item => item.toJSON()) : this._sedentary_minutes
        }
    }
}
