import { Entity } from './entity'
import { JsonUtils } from '../utils/json.utils'

export class HeartRateZone extends Entity {
    private _min_value?: number // Minimum value of heart rate zone.
    private _max_value?: number // Maximum value of heart rate zone.
    private _duration?: number  // Total minutes remaining in the heart rate zone.

    constructor() {
        super()
    }

    get min_value(): number | undefined {
        return this._min_value
    }

    set min_value(value: number | undefined) {
        this._min_value = value
    }

    get max_value(): number | undefined {
        return this._max_value
    }

    set max_value(value: number | undefined) {
        this._max_value = value
    }

    get duration(): number | undefined {
        return this._duration
    }

    set duration(value: number | undefined) {
        this._duration = value
    }

    public fromJSON(json: any): HeartRateZone {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.min_value !== undefined) this.min_value = json.min_value
        if (json.max_value !== undefined) this.max_value = json.max_value
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            min_value: this.min_value,
            max_value: this.max_value,
            duration: this.duration,
        }
    }
}
