import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Fat } from '../../../application/domain/model/fat'
import { FatEntity } from '../fat.entity'

@injectable()
export class FatEntityMapper implements IEntityMapper<Fat, FatEntity> {

    public transform(item: any): any {
        if (item instanceof Fat) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Fat} for {FatEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Fat): FatEntity {
        const result: FatEntity = new FatEntity()

        if (item.id) result.id = item.id
        if (item.type) result.type = item.type
        if (item.timestamp) result.timestamp = item.timestamp
        if (item.value !== undefined) result.value = item.value
        if (item.unit) result.unit = item.unit
        if (item.child_id) result.child_id = item.child_id

        return result
    }

    /**
     * Convert {FatEntity} for {Fat}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: FatEntity): Fat {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for Fat.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Fat {
        const result: Fat = new Fat()

        if (!json) return result
        if (json.id !== undefined) result.id = json.id
        if (json.type !== undefined) result.type = json.type
        if (json.timestamp !== undefined) result.timestamp = json.timestamp
        if (json.value !== undefined) result.value = json.value
        if (json.unit !== undefined) result.unit = json.unit
        if (json.child_id !== undefined) result.child_id = json.child_id

        return result
    }
}
