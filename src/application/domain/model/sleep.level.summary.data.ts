import { ISerializable } from '../utils/serializable.interface'

/**
 * The implementation of the entity summary data of sleep levels.
 *
 * @implements {ISerializable<SleepLevelSummaryData>}
 */
export class SleepLevelSummaryData implements ISerializable<SleepLevelSummaryData> {
    private count: number
    private duration: number

    constructor(count: number, duration: number) {
        this.count = count
        this.duration = duration
    }

    public getCount(): number {
        return this.count
    }

    public setCount(count: number) {
        this.count = count
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
            count: this.count,
            duration: this.duration
        }
    }

    /**
     * Transform JSON into Sleep Level Summary object.
     *
     * @param json
     */
    public deserialize(json: any): SleepLevelSummaryData {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.count) this.setCount(json.count)
        if (json.duration) this.setDuration(json.duration)

        return this
    }
}
