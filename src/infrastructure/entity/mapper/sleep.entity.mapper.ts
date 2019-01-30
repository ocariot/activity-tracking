import { injectable } from 'inversify'
import { Sleep } from '../../../application/domain/model/sleep'
import { SleepEntity } from '../sleep.entity'
import { NameSleepPattern, SleepPattern } from '../../../application/domain/model/sleep.pattern'
import { SleepPatternDataSet } from '../../../application/domain/model/sleep.pattern.data.set'
import { SleepPatternSummary } from '../../../application/domain/model/sleep.pattern.summary'
import { SleepPatternSummaryData } from '../../../application/domain/model/sleep.pattern.summary.data'
import { IEntityMapper } from '../../port/entity.mapper.interface'

@injectable()
export class SleepEntityMapper implements IEntityMapper<Sleep, SleepEntity> {

    public transform(item: any): any {
        if (item instanceof Sleep) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Sleep} for {SleepEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Sleep): SleepEntity {
        const result: SleepEntity = new SleepEntity()

        if (item.id) result.id = item.id
        if (item.start_time) result.start_time = item.start_time
        if (item.end_time) result.end_time = item.end_time
        if (item.duration) result.duration = item.duration
        if (item.child_id) result.child_id = item.child_id
        /**
         * For the object of type SleepEntity, there is an array containing
         * the staging data set, ie it does not contain summary.
         */
        if (item.pattern) {
            result.pattern = item.pattern.data_set.map((elem: SleepPatternDataSet) => elem.toJSON())
        }

        return result
    }

    /**
     * Convert {SleepEntity} for {Sleep}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: SleepEntity): Sleep {
        throw Error('Not Implemented!')
    }

    /**
     * Convert JSON for Sleep.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Sleep {
        const result: Sleep = new Sleep()

        if (!json) return result
        if (json.id !== undefined) result.id = json.id
        if (json.start_time !== undefined) result.start_time = json.start_time
        if (json.end_time !== undefined) result.end_time = json.end_time
        if (json.duration !== undefined) result.duration = json.duration
        if (json.child_id !== undefined) result.child_id = json.child_id
        if (json.pattern !== undefined) result.pattern = this.deserializeSleepPattern(json.pattern)

        return result
    }

    private deserializeSleepPattern(pattern: any): SleepPattern {
        if (!pattern) {
            return new SleepPattern([], new SleepPatternSummary())
        }

        const sleepPatternDataSet: Array<SleepPatternDataSet> = pattern.map(elem => new SleepPatternDataSet().fromJSON(elem))
        const summary: SleepPatternSummary = new SleepPatternSummary()

        const countAsleep = this.countOfPattern(NameSleepPattern.ASLEEP, pattern)
        const countAwake = this.countOfPattern(NameSleepPattern.AWAKE, pattern)
        const countRestless = this.countOfPattern(NameSleepPattern.RESTLESS, pattern)
        const durationAsleep = this.countDurationOfPattern(NameSleepPattern.ASLEEP, pattern)
        const durationAwake = this.countDurationOfPattern(NameSleepPattern.AWAKE, pattern)
        const durationRestless = this.countDurationOfPattern(NameSleepPattern.RESTLESS, pattern)

        summary.asleep = new SleepPatternSummaryData(countAsleep, durationAsleep)
        summary.awake = new SleepPatternSummaryData(countAwake, durationAwake)
        summary.restless = new SleepPatternSummaryData(countRestless, durationRestless)

        return new SleepPattern(sleepPatternDataSet, summary)
    }

    /**
     * Count total sleep pattern records.
     *
     * @param pattern
     * @param dataSet
     */
    private countOfPattern(pattern: string, dataSet: Array<any>): number {
        return dataSet.reduce((prev, item) => {
            if (item.name.toLowerCase() === pattern) return prev + 1
            return prev
        }, 0)
    }

    /**
     * Sum the sleep pattern durations that are in milliseconds
     * and are converted into minutes.
     *
     * @param pattern
     * @param dataSet
     */
    private countDurationOfPattern(pattern: string, dataSet: Array<any>): number {
        return dataSet.reduce((prev, item) => {
            if (item.name.toLowerCase() === pattern && item.duration) return prev + item.duration
            return prev
        }, 0) / 60000
    }
}
