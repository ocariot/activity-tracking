import { ISerializable } from '../utils/serializable.interface'
import { SleepPatternDataSet } from './sleep.pattern.data.set'
import { SleepPatternSummary } from './sleep.pattern.summary'

/**
 * Implementation of the entity of the pattern of sleep.
 *
 * @implements {ISerializable<SleepPattern>}
 */
export class SleepPattern implements ISerializable<SleepPattern> {
    private data_set!: Array<SleepPatternDataSet> // Sleep pattern tracking.
    private summary!: SleepPatternSummary // Summary of sleep pattern.

    constructor(data_set?: Array<SleepPatternDataSet>, summary?: SleepPatternSummary) {
        if (data_set) this.setDataSet(data_set)
        if (summary) this.setSummary(summary)
    }

    public getDataSet(): Array<SleepPatternDataSet> {
        return this.data_set
    }

    public setDataSet(data_set: Array<SleepPatternDataSet>) {
        this.data_set = data_set
    }

    public getSummary(): SleepPatternSummary {
        return this.summary
    }

    public setSummary(summary: SleepPatternSummary) {
        this.summary = summary
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            data_set: this.data_set,
            summary: this.summary.serialize()
        }
    }

    /**
     * Transform JSON into SleepPattern object.
     *
     * @param json
     */
    public deserialize(json: any): SleepPattern {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.data_set) {
            const dataSetTemp = new Array<SleepPatternDataSet>()
            json.data_set.forEach(elem => dataSetTemp.push(new SleepPatternDataSet().deserialize(elem)))
            this.setDataSet(dataSetTemp)
        }
        if (json.summary) this.setSummary(new SleepPatternSummary().deserialize(json.summary))

        return this
    }
}

/**
 * Name of traceable sleep stages.
 */
export enum NameSleepStage {
    AWAKE = 'awake',
    ASLEEP = 'asleep',
    RESTLESS = 'restless'
}
