import { SleepPatternSummaryData } from './sleep.pattern.summary.data'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

/**
 * The implementation of the summary entity of sleep pattern.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<SleepPatternPhasesSummary>}
 */
export class SleepPatternPhasesSummary implements IJSONSerializable, IJSONDeserializable<SleepPatternPhasesSummary> {
    private _awake!: SleepPatternSummaryData
    private _asleep!: SleepPatternSummaryData
    private _restless!: SleepPatternSummaryData

    constructor(awake?: SleepPatternSummaryData, asleep?: SleepPatternSummaryData, restless?: SleepPatternSummaryData) {
        if (awake) this.awake = awake
        if (asleep) this.asleep = asleep
        if (restless) this.restless = restless
    }

    get awake(): SleepPatternSummaryData {
        return this._awake
    }

    set awake(value: SleepPatternSummaryData) {
        this._awake = value
    }

    get asleep(): SleepPatternSummaryData {
        return this._asleep
    }

    set asleep(value: SleepPatternSummaryData) {
        this._asleep = value
    }

    get restless(): SleepPatternSummaryData {
        return this._restless
    }

    set restless(value: SleepPatternSummaryData) {
        this._restless = value
    }

    // Not implemented!
    public fromJSON(json: any): SleepPatternPhasesSummary {
        return this
    }

    public toJSON(): any {
        return {
            awake: this.awake,
            asleep: this.asleep,
            restless: this.restless,
        }
    }
}
