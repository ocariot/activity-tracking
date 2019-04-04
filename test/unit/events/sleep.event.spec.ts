import { assert } from 'chai'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepMock } from '../../mocks/sleep.mock'
import { SleepEvent } from '../../../src/application/integration-event/event/sleep.event'

describe('IntegrationEvents: SleepEvent', () => {
    describe('toJSON()', () => {
        context('when the sleep is valid', () => {
            it('should return the sleep save event', () => {
                const sleep: Sleep = new SleepMock()

                const result = new SleepEvent('SleepSaveEvent', new Date(), sleep).toJSON()
                assert.propertyVal(result, 'event_name', 'SleepSaveEvent')
                assert.property(result, 'timestamp')
                assert.property(result, 'sleep')
            })

            context('when the sleep is undefined', () => {
                it('should return empty object', () => {
                    const result = new SleepEvent('SleepSaveEvent', new Date(), undefined).toJSON()
                    assert.isObject(result)
                    assert.isEmpty(result)
                })
            })
        })
    })
})
