import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * Entity implementation of the activity levels.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<ActivityLevel>}
 */
export class ActivityLevel implements IJSONSerializable, IJSONDeserializable<ActivityLevel> {
    private _name!: string // Name of activity level (sedentary, light, fair or very).
    private _duration!: number // Total time spent in milliseconds on the level.

    constructor(name?: string, duration?: number) {
        if (name) this.name = name
        if (duration) this.duration = duration
    }

    get name(): string {
        return this._name
    }

    set name(value: string) {
        this._name = value.toLowerCase().trim()
    }

    get duration(): number {
        return this._duration
    }

    set duration(value: number) {
        this._duration = value
    }

    public fromJSON(json: any): ActivityLevel {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.name !== undefined) this.name = json.name
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            name: this.name,
            duration: this.duration
        }
    }
}

/**
 * Name of traceable activity levels.
 */
export enum ActivityLevelType {
    SEDENTARY = 'sedentary',
    LIGHTLY = 'lightly',
    FAIRLY = 'fairly',
    VERY = 'very'
}
