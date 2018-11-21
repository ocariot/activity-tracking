import { injectable } from 'inversify'
import { UserEntityMapper } from './user.entity.mapper'
import { IEntityMapper } from './entity.mapper.interface'
import { Sleep } from '../../../application/domain/model/sleep'
import { SleepEntity } from '../sleep.entity'
import { NameSleepLevel, SleepLevel } from '../../../application/domain/model/sleep.level'
import { SleepLevelDataSet } from '../../../application/domain/model/sleep.level.data.set'
import { SleepLevelSummary } from '../../../application/domain/model/sleep.level.summary'
import { SleepLevelSummaryData } from '../../../application/domain/model/sleep.level.summary.data'

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

        const levels: SleepLevel | undefined = item.getLevels()
        if (levels && levels.getDataSet()) {
            result.setLevels(levels.getDataSet().map((elem: SleepLevelDataSet) => elem.serialize()))
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
        result.setCreatedAt(item.getCreatedAt())
        result.setUser(new UserEntityMapper().transform(item.getUser()))

        const levels = item.getLevels()
        if (levels) result.setLevels(this.deserializeSleepLevel(levels))

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
        if (json.levels !== undefined) result.setLevels(this.deserializeSleepLevel(json.levels))
        if (json.created_at !== undefined) result.setCreatedAt(new Date(json.created_at))
        if (json.user !== undefined) result.setUser(new UserEntityMapper().transform(json.user))

        return result
    }

    private deserializeSleepLevel(levels: any): SleepLevel {
        if (!levels) {
            return new SleepLevel([], new SleepLevelSummary())
        }

        const sleepLevelDataSet: Array<SleepLevelDataSet> = levels.map(elem => new SleepLevelDataSet().deserialize(elem))
        const summary: SleepLevelSummary = new SleepLevelSummary()

        const countAsleep = this.countOfLevel(NameSleepLevel.ASLEEP, levels)
        const countAwake = this.countOfLevel(NameSleepLevel.AWAKE, levels)
        const countRestless = this.countOfLevel(NameSleepLevel.RESTLESS, levels)
        const durationAsleep = this.countDurationOfLevel(NameSleepLevel.ASLEEP, levels)
        const durationAwake = this.countDurationOfLevel(NameSleepLevel.AWAKE, levels)
        const durationRestless = this.countDurationOfLevel(NameSleepLevel.RESTLESS, levels)

        summary.setAsleep(new SleepLevelSummaryData(countAsleep, durationAsleep))
        summary.setAwake(new SleepLevelSummaryData(countAwake, durationAwake))
        summary.setRestless(new SleepLevelSummaryData(countRestless, durationRestless))

        return new SleepLevel(sleepLevelDataSet, summary)
    }

    private countOfLevel(level: string, dataSet: Array<any>): number {
        return dataSet.reduce((prev, item) => {
            if (item.name.toLowerCase() === level) return prev + 1
            return prev
        }, 0)
    }

    /**
     *
     * @param level
     * @param dataSet
     */
    private countDurationOfLevel(level: string, dataSet: Array<any>): number {
        return dataSet.reduce((prev, item) => {
            if (item.name.toLowerCase() === level && item.duration) return prev + item.duration
            return prev
        }, 0)
    }
}
