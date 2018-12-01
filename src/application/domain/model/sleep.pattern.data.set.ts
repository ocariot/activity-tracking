import { ISerializable } from '../utils/serializable.interface'

/**
 * The implementation of the data set entity present in the sleep pattern.
 *
 * @implements {ISerializable<SleepPatternDataSet>}
 */
export class SleepPatternDataSet implements ISerializable<SleepPatternDataSet> {
    private start_time!: Date // Date and time of the start of the pattern according to the UTC.
    private name!: string // Sleep pattern name (awake, asleep or restless).
    private duration!: number // Total in milliseconds of the time spent on the pattern.

    constructor(start_time?: Date, name?: string, duration?: number) {
        if (start_time) this.start_time = start_time
        if (name) this.name = name
        if (duration) this.duration = duration
    }

    public getStartTime(): Date {
        return this.start_time
    }

    public setStartTime(start_time: Date): void {
        this.start_time = start_time
    }

    public getName(): string {
        return this.name
    }

    public setName(name: string): void {
        this.name = name
    }

    public getDuration(): number {
        return this.duration
    }

    public setDuration(duration: number): void {
        this.duration = duration
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            start_time: this.start_time ? this.start_time.toISOString() : this.start_time,
            name: this.name,
            duration: this.duration
        }
    }

    /**
     * Transform JSON into SleepPatternDataSet object.
     *
     * @param json
     */
    public deserialize(json: any): SleepPatternDataSet {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.start_time !== undefined) this.setStartTime(new Date(json.start_time))
        if (json.name !== undefined) this.setName(json.name)
        if (json.duration !== undefined) this.setDuration(json.duration)

        return this
    }
}
