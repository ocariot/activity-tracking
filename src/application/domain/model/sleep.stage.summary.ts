import { ISerializable } from '../utils/serializable.interface'
import { SleepStageSummaryData } from './sleep.stage.summary.data'

/**
 * The implementation of the summary entity of sleep stages.
 *
 * @implements {ISerializable<SleepStageSummary>}
 */
export class SleepStageSummary implements ISerializable<SleepStageSummary> {
    private awake!: SleepStageSummaryData
    private asleep!: SleepStageSummaryData
    private restless!: SleepStageSummaryData

    constructor(awake?: SleepStageSummaryData, asleep?: SleepStageSummaryData, restless?: SleepStageSummaryData) {
        if (awake) this.awake = awake
        if (asleep) this.asleep = asleep
        if (restless) this.restless = restless
    }

    public getAwake(): SleepStageSummaryData {
        return this.awake
    }

    public setAwake(awake: SleepStageSummaryData) {
        this.awake = awake
    }

    public getAsleep(): SleepStageSummaryData {
        return this.asleep
    }

    public setAsleep(asleep: SleepStageSummaryData) {
        this.asleep = asleep
    }

    public getRestless(): SleepStageSummaryData {
        return this.restless
    }

    public setRestless(restless: SleepStageSummaryData) {
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
     * Transform JSON into Sleep Stage Summary object.
     *
     * @param json
     */
    public deserialize(json: any): SleepStageSummary {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.awake) this.setAwake(new SleepStageSummaryData(json.awake.count, json.awake.duration))
        if (json.asleep) this.setAsleep(new SleepStageSummaryData(json.asleep.count, json.asleep.duration))
        if (json.restless) this.setRestless(new SleepStageSummaryData(json.restless.count, json.restless.duration))

        return this
    }
}
