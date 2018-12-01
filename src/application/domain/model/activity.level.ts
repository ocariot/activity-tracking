import { ISerializable } from '../utils/serializable.interface'

/**
 * Entity implementation of the activity levels.
 *
 * @implements {ISerializable<ActivityLevel>}
 */
export class ActivityLevel implements ISerializable<ActivityLevel> {
    private name!: string // Name of activity level (sedentary, light, fair or very).
    private duration!: number // Total time spent in milliseconds on the level.

    constructor(name?: string, duration?: number) {
        if (name) this.setName(name)
        if (duration) this.setDuration(duration)
    }

    public getName(): string {
        return this.name
    }

    public setName(name: string) {
        this.name = name
    }

    public getDuration(): number {
        return this.duration
    }

    public setDuration(duration: number) {
        this.duration = duration
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            name: this.name,
            duration: this.duration
        }
    }

    /**
     * Transform JSON into ActivityLevel object.
     *
     * @param json
     */
    public deserialize(json: any): ActivityLevel {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.name !== undefined) this.setName(json.name)
        if (json.duration !== undefined) this.setDuration(json.duration)

        return this
    }
}

/**
 * Name of traceable activity levels.
 */
export enum NameActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHTLY = 'lightly',
    FAIRLY = 'fairly',
    VERY = 'very'
}
