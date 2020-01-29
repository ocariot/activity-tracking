import { injectable } from 'inversify'
import { Sleep, SleepType } from '../../../application/domain/model/sleep'
import { SleepEntity } from '../sleep.entity'
import { SleepPattern } from '../../../application/domain/model/sleep.pattern'
import {
    PhasesPatternType,
    SleepPatternDataSet,
    StagesPatternType
} from '../../../application/domain/model/sleep.pattern.data.set'
import { SleepPatternPhasesSummary } from '../../../application/domain/model/sleep.pattern.phases.summary'
import { SleepPatternSummaryData } from '../../../application/domain/model/sleep.pattern.summary.data'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { SleepPatternStagesSummary } from '../../../application/domain/model/sleep.pattern.stages.summary'

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
            result.pattern = item.pattern.data_set.map((elem: SleepPatternDataSet) => {
                return {
                    start_time: elem.start_time,
                    name: elem.name,
                    duration: elem.duration
                }
            })
        }
        if (item.type) result.type = item.type

        return result
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
        if (json.pattern !== undefined) result.pattern = this.deserializeSleepPattern(json.pattern, json.type)
        if (json.type !== undefined) result.type = json.type

        return result
    }

    private deserializeSleepPattern(pattern: any, sleepType: string): SleepPattern {
        const sleepPattern: SleepPattern = new SleepPattern()

        const sleepPatternDataSet: Array<SleepPatternDataSet> = pattern.map(elem => new SleepPatternDataSet().fromJSON(elem))
        if (sleepType === SleepType.CLASSIC) {
            const summary: SleepPatternPhasesSummary = new SleepPatternPhasesSummary()

            const countAsleep = this.countOfPattern(PhasesPatternType.ASLEEP, pattern)
            const countAwake = this.countOfPattern(PhasesPatternType.AWAKE, pattern)
            const countRestless = this.countOfPattern(PhasesPatternType.RESTLESS, pattern)
            const durationAsleep = this.countDurationOfPattern(PhasesPatternType.ASLEEP, pattern)
            const durationAwake = this.countDurationOfPattern(PhasesPatternType.AWAKE, pattern)
            const durationRestless = this.countDurationOfPattern(PhasesPatternType.RESTLESS, pattern)

            summary.asleep = new SleepPatternSummaryData(countAsleep, durationAsleep)
            summary.awake = new SleepPatternSummaryData(countAwake, durationAwake)
            summary.restless = new SleepPatternSummaryData(countRestless, durationRestless)

            sleepPattern.data_set = sleepPatternDataSet
            sleepPattern.summary = summary
            return sleepPattern
        } else {
            const summary: SleepPatternStagesSummary = new SleepPatternStagesSummary()

            const countDeep = this.countOfPattern(StagesPatternType.DEEP, pattern)
            const countLight = this.countOfPattern(StagesPatternType.LIGHT, pattern)
            const countRem = this.countOfPattern(StagesPatternType.REM, pattern)
            const countAwake = this.countOfPattern(StagesPatternType.AWAKE, pattern)
            const durationDeep = this.countDurationOfPattern(StagesPatternType.DEEP, pattern)
            const durationLight = this.countDurationOfPattern(StagesPatternType.LIGHT, pattern)
            const durationRem = this.countDurationOfPattern(StagesPatternType.REM, pattern)
            const durationAwake = this.countDurationOfPattern(StagesPatternType.AWAKE, pattern)

            summary.deep = new SleepPatternSummaryData(countDeep, durationDeep)
            summary.light = new SleepPatternSummaryData(countLight, durationLight)
            summary.rem = new SleepPatternSummaryData(countRem, durationRem)
            summary.awake = new SleepPatternSummaryData(countAwake, durationAwake)

            sleepPattern.data_set = sleepPatternDataSet
            sleepPattern.summary = summary
            return sleepPattern
        }
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
     * Sum the sleep pattern durations that are in milliseconds.
     *
     * @param pattern
     * @param dataSet
     */
    private countDurationOfPattern(pattern: string, dataSet: Array<any>): number {
        return dataSet.reduce((prev, item) => {
            if (item.name.toLowerCase() === pattern && item.duration) return prev + item.duration
            return prev
        }, 0)
    }
}
