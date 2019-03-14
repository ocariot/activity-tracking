import { ObjectID } from 'bson'
import { assert } from 'chai'
import { Environment } from '../../../src/application/domain/model/environment'
import { Measurement } from '../../../src/application/domain/model/measurement'
import { Location } from '../../../src/application/domain/model/location'
import { EnvironmentEntityMapper } from '../../../src/infrastructure/entity/mapper/environment.entity.mapper'
import { EnvironmentMock } from '../../mocks/environment.mock'

describe('Mappers: EnvironmentEntity', () => {
    const environment: Environment = new EnvironmentMock()

    // Create environment JSON
    const environmentJSON: any = {
        id: new ObjectID(),
        institution_id: new ObjectID(),
        location: new Location(),
        measurements: new Array<Measurement>(),
        climatized: true,
        timestamp: new Date().toISOString()
    }

    describe('transform(item: any)', () => {
        context('when the parameter is of type Environment', () => {
            it('should normally execute the method, returning an EnvironmentEntity as a result of the transformation', () => {
                const result = new EnvironmentEntityMapper().transform(environment)
                assert(result.id, 'id must not be undefined')
                assert.propertyVal(result, 'id', environment.id)
                assert(result.institution_id, 'institution_id must not be undefined')
                assert.propertyVal(result, 'institution_id', environment.institution_id)
                assert(result.location, 'location must not be undefined')
                if (result.climatized) assert.propertyVal(result, 'climatized', environment.climatized)
                assert(result.timestamp, 'timestamp must not be undefined')
                assert.propertyVal(result, 'timestamp', environment.timestamp)
                assert(result.measurements, 'measurements must not be undefined')
            })
        })

        context('when the parameter is a JSON', () => {
            it('should not normally execute the method, returning a JSON as a result of the transformation', () => {
                const result = new EnvironmentEntityMapper().transform(environmentJSON)
                assert(result.id, 'id must not be undefined')
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert(result.institution_id, 'institution_id must not be undefined')
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert(result.location, 'location must not be undefined')
                assert(result.timestamp, 'timestamp must not be undefined')
                assert.propertyVal(result, 'timestamp', environmentJSON.timestamp)
                assert(result.measurements, 'measurements must not be undefined')
            })
        })
    })
})
