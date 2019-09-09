import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Location } from '../../../src/application/domain/model/location'
import { EnvironmentEntityMapper } from '../../../src/infrastructure/entity/mapper/environment.entity.mapper'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentEntity } from '../../../src/infrastructure/entity/environment.entity'
import { Environment } from '../../../src/application/domain/model/environment'
import { Measurement } from '../../../src/application/domain/model/measurement'

describe('Mappers: EnvironmentEntityMapper', () => {
    const environment: Environment = new EnvironmentMock()

    // To test how mapper works with an object without any attributes
    const emptyEnvironment: Environment = new Environment()

    // Create environment JSON
    const environmentJSON: any = {
        id: new ObjectID(),
        institution_id: new ObjectID(),
        location: new Location(),
        measurements: environment.measurements,
        climatized: true,
        timestamp: new Date()
    }

    // To test how mapper works with an object without any attributes (JSON)
    const emptyEnvironmentJSON: any = {}

    describe('transform(item: any)', () => {
        context('when the parameter is of type Environment', () => {
            it('should normally execute the method, returning an EnvironmentEntity as a result of the transformation', () => {
                const result: EnvironmentEntity = new EnvironmentEntityMapper().transform(environment)
                assert.propertyVal(result, 'id', environment.id)
                assert.propertyVal(result, 'institution_id', environment.institution_id)
                assert.deepPropertyVal(result, 'location', environment.location!.toJSON())
                assert.deepPropertyVal(result, 'measurements',
                    environment.measurements!.map((elem: Measurement) => elem.toJSON()))
                if (result.climatized) assert.propertyVal(result, 'climatized', environment.climatized)
                assert.propertyVal(result, 'timestamp', environment.timestamp)
            })
        })

        context('when the parameter is of type Environment and does not contain any attributes', () => {
            it('should normally execute the method, returning an empty EnvironmentEntity', () => {
                const result: EnvironmentEntity = new EnvironmentEntityMapper().transform(emptyEnvironment)
                assert.isEmpty(result)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should normally execute the method, returning an Environment as a result of the transformation', () => {
                const result: Environment = new EnvironmentEntityMapper().transform(environmentJSON)
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert.deepEqual(result.location, environmentJSON.location)
                assert.deepPropertyVal(result, 'measurements', environmentJSON.measurements)
                assert.propertyVal(result, 'timestamp', environmentJSON.timestamp)
            })
        })

        context('when the parameter is a JSON and does not contain any attributes', () => {
            it('should normally execute the method, returning an Environment as a result of the transformation', () => {
                const result: Environment = new EnvironmentEntityMapper().transform(emptyEnvironmentJSON)
                assert.propertyVal(result, 'id', emptyEnvironmentJSON.id)
                assert.propertyVal(result, 'institution_id', emptyEnvironmentJSON.institution_id)
                assert.propertyVal(result, 'location', emptyEnvironmentJSON.location)
                assert.propertyVal(result, 'measurements', emptyEnvironmentJSON.measurements)
                assert.propertyVal(result, 'timestamp', emptyEnvironmentJSON.timestamp)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should normally execute the method, returning an empty Environment as a result of the transformation', () => {
                const result: Environment = new EnvironmentEntityMapper().transform(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'institution_id', undefined)
                assert.propertyVal(result, 'location', undefined)
                assert.propertyVal(result, 'measurements', undefined)
                assert.propertyVal(result, 'climatized', undefined)
                assert.propertyVal(result, 'timestamp', undefined)
            })
        })
    })
})
