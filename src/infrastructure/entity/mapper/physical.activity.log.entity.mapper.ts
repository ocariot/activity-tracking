import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import {PhysicalActivityLog} from '../../../application/domain/model/physical.activity.log'
import {PhysicalActivityLogEntity} from '../physical.activity.log.entity'
import {Log} from '../../../application/domain/model/log'

@injectable()
export class PhysicalActivityLogEntityMapper implements IEntityMapper<PhysicalActivityLog, PhysicalActivityLogEntity> {

    public transform(item: any): any {
        if (item instanceof PhysicalActivityLog) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {PhysicalActivityLog} for {PhysicalActivityLogEntity}.
     *
     * @param item
     */
    public modelToModelEntity(item: PhysicalActivityLog): PhysicalActivityLogEntity {
        const result: PhysicalActivityLogEntity = new PhysicalActivityLogEntity()

        if (item.id) result.id = item.id
        if (item.steps !== undefined && item.steps.length > 0) {
            result.steps = item.steps.map((elem: Log) => elem.toJSON())
        } else result.steps = []
        if (item.calories !== undefined && item.calories.length > 0) {
            result.calories = item.calories.map((elem: Log) => elem.toJSON())
        } else result.calories = []

        return result
    }

    /**
     * Convert {PhysicalActivityLogEntity} for {PhysicalActivityLog}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: PhysicalActivityLogEntity): PhysicalActivityLog {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for PhysicalActivityLog.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): PhysicalActivityLog {
        const result: PhysicalActivityLog = new PhysicalActivityLog()

        if (!json) return result
        if (json.id !== undefined) result.id = json.id
        if (json.steps !== undefined && json.steps.length > 0) {
            result.steps = json.steps.map(elem => new Log().fromJSON(elem))
        }
        if (json.calories !== undefined && json.calories.length > 0) {
            result.calories = json.calories.map(elem => new Log().fromJSON(elem))
        }

        return result
    }
}
