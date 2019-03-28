import { assert } from 'chai'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { EnvironmentEvent } from '../../../src/application/integration-event/event/environment.event'

describe('IntegrationEvents: EnvironmentEvent', () => {
    describe('toJSON()', () => {
        context('when the environment is valid', () => {
            it('should return the environment save event', () => {
                const environment: Environment = new EnvironmentMock()

                const result = new EnvironmentEvent('EnvironmentSaveEvent', new Date(), environment).toJSON()
                assert.property(result, 'event_name')
                assert.property(result, 'timestamp')
                assert.property(result, 'environment')
            })

            context('when the environment is undefined', () => {
                it('should return empty object', () => {
                    const result = new EnvironmentEvent('EnvironmentSaveEvent', new Date(), undefined).toJSON()
                    assert.isObject(result)
                    assert.isEmpty(result)
                })
            })
        })
    })
})
