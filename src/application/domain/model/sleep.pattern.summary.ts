import { ISerializable } from '../utils/serializable.interface'
import { SleepPatternSummaryData } from './sleep.pattern.summary.data'

/**
 * The implementation of the summary entity of sleep pattern.
 *
 * @implements {ISerializable<SleepPatternSummary>}
 */
export class SleepPatternSummary implements ISerializable<SleepPatternSummary> {
    private awake!: SleepPatternSummaryData
    private asleep!: SleepPatternSummaryData
    private restless!: SleepPatternSummaryData

    constructor(awake?: SleepPatternSummaryData, asleep?: SleepPatternSummaryData, restless?: SleepPatternSummaryData) {
        if (awake) this.awake = awake
        if (asleep) this.asleep = asleep
        if (restless) this.restless = restless
    }

    public getAwake(): SleepPatternSummaryData {
        return this.awake
    }

    public setAwake(awake: SleepPatternSummaryData) {
        this.awake = awake
    }

    public getAsleep(): SleepPatternSummaryData {
        return this.asleep
    }

    public setAsleep(asleep: SleepPatternSummaryData) {
        this.asleep = asleep
    }

    public getRestless(): SleepPatternSummaryData {
        return this.restless
    }

    public setRestless(restless: SleepPatternSummaryData) {
        this.restless = restless
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            awake: this.awake,
            asleep: this.asleep,
            restless: this.restless
        }
    }

    /**
     * Transform JSON into SleepPatternSummary object.
     *
     * @param json
     */
    public deserialize(json: any): SleepPatternSummary {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.awake) this.setAwake(new SleepPatternSummaryData(json.awake.count, json.awake.duration))
        if (json.asleep) this.setAsleep(new SleepPatternSummaryData(json.asleep.count, json.asleep.duration))
        if (json.restless) this.setRestless(new SleepPatternSummaryData(json.restless.count, json.restless.duration))

        return this
    }
}
