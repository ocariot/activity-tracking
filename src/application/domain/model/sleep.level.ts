import { ISerializable } from '../utils/serializable.interface'
import { SleepLevelDataSet } from './sleep.level.data.set'
import { SleepLevelSummary } from './sleep.level.summary'

/**
 * Implementation of the entity of the level of sleep.
 *
 * @implements {ISerializable<User>}
 */
export class SleepLevel implements ISerializable<SleepLevel> {
    private data_set: Array<SleepLevelDataSet> // Sleep level tracking.
    private summary: SleepLevelSummary // Summary of sleep levels

    constructor(data_set: Array<SleepLevelDataSet>, summary: SleepLevelSummary) {
        this.data_set = data_set
        this.summary = summary
    }

    public getDataSet(): Array<SleepLevelDataSet> {
        return this.data_set
    }

    public setDataSet(data_set: Array<SleepLevelDataSet>) {
        this.data_set = data_set
    }

    public getSummary(): SleepLevelSummary {
        return this.summary
    }

    public setSummary(summary: SleepLevelSummary) {
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
     * Transform JSON into SleepLevel object.
     *
     * @param json
     */
    public deserialize(json: any): SleepLevel {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.data_set) this.setDataSet(json.data_set)
        if (json.summary) this.setSummary(new SleepLevelSummary().deserialize(json.summary))

        return this
    }
}

/**
 * Name of traceable sleep levels.
 */
export enum NameSleepLevel {
    AWAKE = 'Awake',
    ASLEEP = 'Asleep',
    RESTLESS = 'Restless'
}
