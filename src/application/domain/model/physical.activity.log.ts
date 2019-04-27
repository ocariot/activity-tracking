import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Log } from './log'
import { Entity } from './entity'

/**
 * Entity implementation of the physicalactivities logs.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Log>}
 */
export class PhysicalActivityLog extends Entity implements IJSONSerializable, IJSONDeserializable<PhysicalActivityLog> {
    private _steps!: Array<Log> // Logs of steps by a child
    private _calories!: Array<Log> // Logs of calories by a child
    private _activeMinutes!: Array<Log> // Logs of active minutes of a child

    constructor() {
        super()
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

    get activeMinutes(): Array<Log> {
        return this._activeMinutes
    }

    set activeMinutes(value: Array<Log>) {
        this._activeMinutes = value
    }

    public fromJSON(json: any): PhysicalActivityLog {
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

        if (json.activeMinutes !== undefined && json.activeMinutes instanceof Array) {
            this._activeMinutes = json.activeMinutes.map(activeMinutes => new Log().fromJSON(activeMinutes))
        }

        return this
    }

    public toJSON(): any {
        return {
            steps: this._steps ? this._steps.map(item => item.toJSON()) : this._steps,
            calories: this._calories ? this._calories.map(item => item.toJSON()) : this._calories,
            activeMinutes: this._activeMinutes ? this._activeMinutes.map(item => item.toJSON()) : this._activeMinutes
        }
    }
}
