import { IJSONSerializable } from '../utils/json.serializable.interface'
import { Log } from './log'

/**
 * Entity implementation of the child logs.
 *
 * @implements {IJSONSerializable}
 */
export class ChildLog implements IJSONSerializable {
    private _steps!: Array<Log> // Logs of steps of a child
    private _calories!: Array<Log> // Logs of calories of a child
    private _active_minutes!: Array<Log> // Logs of active minutes of a child
    private _lightly_active_minutes!: Array<Log> // Logs of lightly active minutes of a child
    private _sedentary_minutes!: Array<Log> // Logs of sedentary minutes of a child

    constructor(steps?: Array<Log>, calories?: Array<Log>, active_minutes?: Array<Log>, lightly_active_minutes?: Array<Log>,
                sedentary_minutes?: Array<Log>) {
        if (steps) this.steps = steps
        if (calories) this.calories = calories
        if (active_minutes) this.active_minutes = active_minutes
        if (lightly_active_minutes) this.lightly_active_minutes = lightly_active_minutes
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

    get lightly_active_minutes(): Array<Log> {
        return this._lightly_active_minutes
    }

    set lightly_active_minutes(value: Array<Log>) {
        this._lightly_active_minutes = value
    }

    get sedentary_minutes(): Array<Log> {
        return this._sedentary_minutes
    }

    set sedentary_minutes(value: Array<Log>) {
        this._sedentary_minutes = value
    }

    public toJSON(): any {
        return {
            steps: this.steps ? this.steps.map(item => item.toJSON()) : this.steps,
            calories: this.calories ? this.calories.map(item => item.toJSON()) : this.calories,
            active_minutes: this.active_minutes ? this.active_minutes.map(item => item.toJSON()) : this.active_minutes,
            lightly_active_minutes:
                this.lightly_active_minutes ? this.lightly_active_minutes.map(item => item.toJSON()) : this.lightly_active_minutes,
            sedentary_minutes:
                this.sedentary_minutes ? this.sedentary_minutes.map(item => item.toJSON()) : this.sedentary_minutes
        }
    }
}
