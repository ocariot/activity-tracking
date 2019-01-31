import { injectable } from 'inversify'
import { Environment } from '../../../application/domain/model/environment'
import { EnvironmentEntity } from '../environment.entity'
import { Location } from '../../../application/domain/model/location'
import { Measurement } from '../../../application/domain/model/measurement'
import { IEntityMapper } from '../../port/entity.mapper.interface'

@injectable()
export class EnvironmentEntityMapper implements IEntityMapper<Environment, EnvironmentEntity> {

    public transform(item: any): any {
        if (item instanceof Environment) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {Environment} for {EnvironmentEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: Environment): EnvironmentEntity {
        const result: EnvironmentEntity = new EnvironmentEntity()
        console.log('env', item.toJSON())

        if (item.id) result.id = item.id
        if (item.institution_id) result.institution_id = item.institution_id
        if (item.location) result.location = item.location.toJSON()
        if (item.climatized !== undefined) result.climatized = item.climatized
        if (item.timestamp) result.timestamp = item.timestamp
        if (item.measurements) {
            result.measurements = item.measurements.map((measurement: Measurement) => measurement.toJSON())
        }

        console.log('env re', result)
        return result
    }

    /**
     * Convert {EnvironmentEntity} for {Environment}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: EnvironmentEntity): Environment {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for Environment.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): Environment {
        const result: Environment = new Environment()

        if (!json) return result
        if (json.id) result.id = json.id
        if (json.institution_id) result.institution_id = json.institution_id
        if (json.location) result.location = new Location().fromJSON(json.location)
        if (json.climatized) result.climatized = json.climatized
        if (json.timestamp) result.timestamp = json.timestamp
        if (json.measurements) {
            result.measurements = json.measurements.map(item => new Measurement().fromJSON(item))
        }

        return result
    }
}
