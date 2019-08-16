import { assert } from 'chai'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentEvent } from '../../../src/application/integration-event/event/environment.event'
import { EventType } from '../../../src/application/integration-event/event/integration.event'
import { Measurement } from '../../../src/application/domain/model/measurement'

describe('IntegrationEvents: EnvironmentEvent', () => {
    describe('toJSON()', () => {
        context('when the environment is valid', () => {
            it('should return the environment save event', () => {
                const environment: Environment = new EnvironmentMock()

                const result = new EnvironmentEvent('EnvironmentSaveEvent', new Date(), environment).toJSON()
                assert.propertyVal(result, 'event_name', 'EnvironmentSaveEvent')
                assert.property(result, 'timestamp')
                assert.propertyVal(result, 'type', EventType.ENVIRONMENTS)
                assert.propertyVal(result.environment, 'id', environment.id)
                assert.propertyVal(result.environment, 'institution_id', environment.institution_id)
                assert.propertyVal(result.environment, 'timestamp', environment.timestamp)
                assert.propertyVal(result.environment, 'climatized', environment.climatized)
                assert.deepPropertyVal(result.environment, 'measurements',
                    environment.measurements!.map((elem: Measurement) => elem.toJSON()))
                assert.propertyVal(result.environment.location, 'local', environment.location!.local)
                assert.propertyVal(result.environment.location, 'room', environment.location!.room)
                assert.propertyVal(result.environment.location, 'latitude', environment.location!.latitude)
                assert.propertyVal(result.environment.location, 'longitude', environment.location!.longitude)
            })
        })

        context('when the environment is undefined', () => {
            it('should return empty object', () => {
                const result = new EnvironmentEvent('EnvironmentSaveEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
