import { injectable } from 'inversify'
import { IEntityMapper } from './entity.mapper.interface'
import { Environment } from '../../../application/domain/model/environment'
import { EnvironmentEntity } from '../environment.entity'
import { Location } from '../../../application/domain/model/location'

@injectable()
export class EnvironmentEntityMapper implements IEntityMapper<Environment, EnvironmentEntity> {

    public transform(item: any): any {
        if (item instanceof Environment) return this.modelToModelEntity(item)
        if (item instanceof EnvironmentEntity) return this.modelEntityToModel(item)
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

        if (item.getId()) result.setId(item.getId())
        if (item.getTimestamp()) result.setTimestamp(item.getTimestamp())
        if (item.getTemperature()) result.setTemperature(item.getTemperature())
        if (item.getHumidity()) result.setHumidity(item.getHumidity())
        const location = item.getLocation()
        if (location) result.setLocation(location.serialize())

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
        const result: Environment = new Environment()

        result.setId(item.getId())
        result.setTimestamp(item.getTimestamp())
        result.setTemperature(item.getTemperature())
        result.setHumidity(item.getHumidity())
        result.setLocation(new Location().deserialize(item.getLocation()))
        result.setCreatedAt(item.getCreatedAt())

        return result
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
        if (json.id !== undefined) result.setId(json.id)
        if (json.timestamp !== undefined) result.setTimestamp(new Date(json.timestamp))
        if (json.temperature !== undefined) result.setTemperature(Number(json.temperature))
        if (json.humidity !== undefined) result.setHumidity(Number(json.humidity))
        if (json.location !== undefined) result.setLocation(new Location().deserialize(json.location))
        if (json.created_at !== undefined) result.setCreatedAt(new Date(json.created_at))

        return result
    }
}
