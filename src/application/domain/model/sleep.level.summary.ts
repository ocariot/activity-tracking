import { ISerializable } from '../utils/serializable.interface'
import { SleepLevelSummaryData } from './sleep.level.summary.data'

/**
 * The implementation of the summary entity of sleep levels.
 *
 * @implements {ISerializable<SleepLevelSummary>}
 */
export class SleepLevelSummary implements ISerializable<SleepLevelSummary> {
    private awake!: SleepLevelSummaryData
    private asleep!: SleepLevelSummaryData
    private restless!: SleepLevelSummaryData

    constructor(awake?: SleepLevelSummaryData, asleep?: SleepLevelSummaryData, restless?: SleepLevelSummaryData) {
        if (awake) this.awake = awake
        if (asleep) this.asleep = asleep
        if (restless) this.restless = restless
    }

    public getAwake(): SleepLevelSummaryData {
        return this.awake
    }

    public setAwake(awake: SleepLevelSummaryData) {
        this.awake = awake
    }

    public getAsleep(): SleepLevelSummaryData {
        return this.asleep
    }

    public setAsleep(asleep: SleepLevelSummaryData) {
        this.asleep = asleep
    }

    public getRestless(): SleepLevelSummaryData {
        return this.restless
    }

    public setRestless(restless: SleepLevelSummaryData) {
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
     * Transform JSON into Sleep Level Summary object.
     *
     * @param json
     */
    public deserialize(json: any): SleepLevelSummary {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.awake) this.setAwake(new SleepLevelSummaryData(json.awake.count, json.awake.duration))
        if (json.asleep) this.setAsleep(new SleepLevelSummaryData(json.asleep.count, json.asleep.duration))
        if (json.restless) this.setRestless(new SleepLevelSummaryData(json.restless.count, json.restless.duration))

        return this
    }
}
