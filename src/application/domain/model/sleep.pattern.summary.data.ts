import { ISerializable } from '../utils/serializable.interface'

/**
 * The implementation of the entity summary data of sleep pattern.
 *
 * @implements {ISerializable<SleepPatternSummaryData>}
 */
export class SleepPatternSummaryData implements ISerializable<SleepPatternSummaryData> {
    private count: number
    private duration: number // in minutes

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
     * Transform JSON into SleepPatternSummaryData object.
     *
     * @param json
     */
    public deserialize(json: any): SleepPatternSummaryData {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.count !== undefined) this.setCount(json.count)
        if (json.duration !== undefined) this.setDuration(json.duration)

        return this
    }
}
