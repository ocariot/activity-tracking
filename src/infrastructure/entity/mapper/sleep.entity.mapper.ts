import { injectable } from 'inversify'
import { UserEntityMapper } from './user.entity.mapper'
import { IEntityMapper } from './entity.mapper.interface'
import { Sleep } from '../../../application/domain/model/sleep'
import { SleepEntity } from '../sleep.entity'
import { NameSleepStage, SleepPattern } from '../../../application/domain/model/sleep.pattern'
import { SleepPatternDataSet } from '../../../application/domain/model/sleep.pattern.data.set'
import { SleepPatternSummary } from '../../../application/domain/model/sleep.pattern.summary'
import { SleepPatternSummaryData } from '../../../application/domain/model/sleep.pattern.summary.data'

@injectable()
export class SleepEntityMapper implements IEntityMapper<Sleep, SleepEntity> {

    public transform(item: any): any {
        if (item instanceof Sleep) return this.modelToModelEntity(item)
        if (item instanceof SleepEntity) return this.modelEntityToModel(item)
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

        if (item.getId()) result.setId(item.getId())
        if (item.getStartTime()) result.setStartTime(item.getStartTime())
        if (item.getEndTime()) result.setEndTime(item.getEndTime())
        if (item.getDuration()) result.setDuration(item.getDuration())
        if (item.getUser() && item.getUser().getId()) result.setUser(item.getUser().getId())

        /**
         * For the object of type SleepEntity, there is an array containing
         * the staging data set, ie it does not contain summary.
         */
        const pattern: SleepPattern | undefined = item.getPattern()
        if (pattern && pattern.getDataSet()) {
            result.setPattern(pattern.getDataSet().map((elem: SleepPatternDataSet) => elem.serialize()))
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
        const result: Sleep = new Sleep()

        result.setId(item.getId())
        result.setStartTime(item.getStartTime())
        result.setEndTime(item.getEndTime())
        result.setDuration(item.getDuration())
        result.setUser(new UserEntityMapper().transform(item.getUser()))

        const pattern = item.getPattern()
        if (pattern) result.setPattern(this.deserializeSleepStage(pattern))

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
        if (json.id !== undefined) result.setId(json.id)
        if (json.start_time !== undefined) result.setStartTime(new Date(json.start_time))
        if (json.end_time !== undefined) result.setEndTime(new Date(json.end_time))
        if (json.duration !== undefined) result.setDuration(Number(json.duration))
        if (json.pattern !== undefined) result.setPattern(this.deserializeSleepStage(json.pattern))
        if (json.user !== undefined) result.setUser(new UserEntityMapper().transform(json.user))

        return result
    }

    private deserializeSleepStage(pattern: any): SleepPattern {
        if (!pattern) {
            return new SleepPattern([], new SleepPatternSummary())
        }

        const sleepStageDataSet: Array<SleepPatternDataSet> = pattern.map(elem => new SleepPatternDataSet().deserialize(elem))
        const summary: SleepPatternSummary = new SleepPatternSummary()

        const countAsleep = this.countOfStage(NameSleepStage.ASLEEP, pattern)
        const countAwake = this.countOfStage(NameSleepStage.AWAKE, pattern)
        const countRestless = this.countOfStage(NameSleepStage.RESTLESS, pattern)
        const durationAsleep = this.countDurationOfStage(NameSleepStage.ASLEEP, pattern)
        const durationAwake = this.countDurationOfStage(NameSleepStage.AWAKE, pattern)
        const durationRestless = this.countDurationOfStage(NameSleepStage.RESTLESS, pattern)

        summary.setAsleep(new SleepPatternSummaryData(countAsleep, durationAsleep))
        summary.setAwake(new SleepPatternSummaryData(countAwake, durationAwake))
        summary.setRestless(new SleepPatternSummaryData(countRestless, durationRestless))

        return new SleepPattern(sleepStageDataSet, summary)
    }

    private countOfStage(stage: string, dataSet: Array<any>): number {
        return dataSet.reduce((prev, item) => {
            if (item.name.toLowerCase() === stage) return prev + 1
            return prev
        }, 0)
    }

    /**
     *
     * @param stage
     * @param dataSet
     */
    private countDurationOfStage(stage: string, dataSet: Array<any>): number {
        return dataSet.reduce((prev, item) => {
            if (item.name.toLowerCase() === stage && item.duration) return prev + item.duration
            return prev
        }, 0)
    }
}
