import { injectable } from 'inversify'
import { UserEntityMapper } from './user.entity.mapper'
import { IEntityMapper } from './entity.mapper.interface'
import { Sleep } from '../../../application/domain/model/sleep'
import { SleepEntity } from '../sleep.entity'
import { SleepLevel } from '../../../application/domain/model/sleep.level'
import { SleepLevelDataSet } from '../../../application/domain/model/sleep.level.data.set'
import { SleepLevelSummary } from '../../../application/domain/model/sleep.level.summary'

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

        const levels = item.getLevels()
        if (levels && levels.getDataSet()) {
            const sleepLevels: Array<SleepLevelDataSet> = []
            levels.getDataSet().forEach((data: SleepLevelDataSet) => {
                sleepLevels.push(new SleepLevelDataSet(data.getStartTime(), data.getName(), data.getDuration()))
            })
            result.setLevels(sleepLevels)
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
        result.setLevels(this.deserializeSleepLevel(item.getLevels()))
        result.setCreatedAt(item.getCreatedAt())
        result.setUser(new UserEntityMapper().transform(item.getUser()))

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
        if (json.levels !== undefined) result.setLevels(this.deserializeSleepLevel(json.lavels))
        if (json.created_at !== undefined) result.setCreatedAt(new Date(json.created_at))
        if (json.user !== undefined) result.setUser(new UserEntityMapper().transform(json.user))

        return result
    }

    private deserializeSleepLevel(dataSet: any): SleepLevel {
        if (!dataSet || !(dataSet instanceof Array)) {
            return new SleepLevel([new SleepLevelDataSet()], new SleepLevelSummary())
        }
        const sleepLevelDataSet: Array<SleepLevelDataSet> = []
        // let countAsleep, durationAsleep = 0
        // let countAwake, durationAwake = 0
        // let countRestless, durationRestless = 0
        // dataSet.forEach(data => {
        //     sleepLevelDataSet.push(new SleepLevelDataSet().deserialize(data))
        //     if()
        // })

        return new SleepLevel(sleepLevelDataSet,
            new SleepLevelSummary().deserialize(dataSet))
    }
}
