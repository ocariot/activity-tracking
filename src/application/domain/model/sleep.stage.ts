import { ISerializable } from '../utils/serializable.interface'
import { SleepStageDataSet } from './sleep.stage.data.set'
import { SleepStageSummary } from './sleep.stage.summary'

/**
 * Implementation of the entity of the stage of sleep.
 *
 * @implements {ISerializable<SleepStage>}
 */
export class SleepStage implements ISerializable<SleepStage> {
    private data_set!: Array<SleepStageDataSet> // Sleep stage tracking.
    private summary!: SleepStageSummary // Summary of sleep stages

    constructor(data_set?: Array<SleepStageDataSet>, summary?: SleepStageSummary) {
        if (data_set) this.setDataSet(data_set)
        if (summary) this.setSummary(summary)
    }

    public getDataSet(): Array<SleepStageDataSet> {
        return this.data_set
    }

    public setDataSet(data_set: Array<SleepStageDataSet>) {
        this.data_set = data_set
    }

    public getSummary(): SleepStageSummary {
        return this.summary
    }

    public setSummary(summary: SleepStageSummary) {
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
     * Transform JSON into SleepStage object.
     *
     * @param json
     */
    public deserialize(json: any): SleepStage {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.data_set) {
            const dataSetTemp = new Array<SleepStageDataSet>()
            json.data_set.forEach(elem => dataSetTemp.push(new SleepStageDataSet().deserialize(elem)))
            this.setDataSet(dataSetTemp)
        }
        if (json.summary) this.setSummary(new SleepStageSummary().deserialize(json.summary))

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
