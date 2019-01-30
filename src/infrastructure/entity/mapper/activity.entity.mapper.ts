import { injectable } from 'inversify'
import { PhysicalActivity } from '../../../application/domain/model/physical.activity'
import { ActivityLevel } from '../../../application/domain/model/activity.level'
import { PhysicalActivityEntity } from '../physical.activity.entity'
import { IEntityMapper } from '../../port/entity.mapper.interface'

@injectable()
export class ActivityEntityMapper implements IEntityMapper<PhysicalActivity, PhysicalActivityEntity> {

    public transform(item: any): any {
        if (item instanceof PhysicalActivity) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {PhysicalActivity} for {PhysicalActivityEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: PhysicalActivity): PhysicalActivityEntity {
        const result: PhysicalActivityEntity = new PhysicalActivityEntity()

        if (item.id) result.id = item.id
        if (item.start_time) result.start_time = item.start_time
        if (item.end_time) result.end_time = item.end_time
        if (item.duration) result.duration = item.duration
        if (item.child_id) result.child_id = item.child_id
        if (item.name) result.name = item.name
        if (item.calories) result.calories = item.calories
        if (item.steps) result.steps = item.steps
        if (item.levels && item.levels instanceof Array) {
            result.levels = item.levels.map((elem: ActivityLevel) => elem.toJSON())
        }

        return result
    }

    /**
     * Convert {PhysicalActivityEntity} for {PhysicalActivity}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: PhysicalActivityEntity): PhysicalActivity {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for PhysicalActivity.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): PhysicalActivity {
        const result: PhysicalActivity = new PhysicalActivity()

        if (json.id !== undefined) result.id = json.id
        if (json.start_time !== undefined) result.start_time = json.start_time
        if (json.end_time !== undefined) result.end_time = json.end_time
        if (json.duration !== undefined) result.duration = json.duration
        if (json.name !== undefined) result.name = json.name
        if (json.calories !== undefined) result.calories = json.calories
        if (json.steps !== undefined) result.steps = json.steps
        if (json.child_id !== undefined) result.child_id = json.child_id
        if (json.levels !== undefined && json.levels instanceof Array) {
            result.levels = json.levels.map(elem => new ActivityLevel().fromJSON(elem))
        }

        return result
    }
}
