import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Location } from '../../../src/application/domain/model/location'
import { EnvironmentEntityMapper } from '../../../src/infrastructure/entity/mapper/environment.entity.mapper'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { TemperatureMock } from '../../mocks/temperature.mock'
import { HumidityMock } from '../../mocks/humidity.mock'

describe('Mappers: EnvironmentEntityMapper', () => {
    const environment: EnvironmentMock = new EnvironmentMock()

    // Create environment JSON
    const environmentJSON: any = {
        id: new ObjectID(),
        institution_id: new ObjectID(),
        location: new Location(),
        temperature: new TemperatureMock(),
        humidity: new HumidityMock(),
        climatized: true,
        timestamp: new Date().toISOString()
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Environment', () => {
            it('should normally execute the method, returning an EnvironmentEntity as a result of the transformation', () => {
                const result = new EnvironmentEntityMapper().transform(environment)
                assert.propertyVal(result, 'id', environment.id)
                assert.propertyVal(result, 'institution_id', environment.institution_id)
                assert(result.location, 'location must not be undefined')
                assert.propertyVal(result, 'temperature', environment.temperature)
                assert.propertyVal(result, 'humidity', environment.humidity)
                if (result.climatized) assert.propertyVal(result, 'climatized', environment.climatized)
                assert.propertyVal(result, 'timestamp', environment.timestamp)
            })
        })

        context('when the parameter is a JSON', () => {
            it('should normally execute the method, returning an Environment as a result of the transformation', () => {
                const result = new EnvironmentEntityMapper().transform(environmentJSON)
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert(result.location, 'location must not be undefined')
                assert.propertyVal(result, 'temperature', environmentJSON.temperature)
                assert.propertyVal(result, 'humidity', environmentJSON.humidity)
                assert.propertyVal(result, 'timestamp', environmentJSON.timestamp)
            })
        })

        context('when the parameter is a undefined', () => {
            it('should normally execute the method, returning an empty Environment as a result of the transformation', () => {
                const result = new EnvironmentEntityMapper().transform(undefined)

                assert.isObject(result)
                assert.propertyVal(result, 'id', undefined)
            })
        })
    })
})
