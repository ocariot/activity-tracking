import { assert } from 'chai'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepMock } from '../../mocks/sleep.mock'
import { SleepEvent } from '../../../src/application/integration-event/event/sleep.event'
import { EventType } from '../../../src/application/integration-event/event/integration.event'

describe('IntegrationEvents: SleepEvent', () => {
    describe('toJSON()', () => {
        context('when the sleep is valid', () => {
            it('should return the sleep save event', () => {
                const sleep: Sleep = new SleepMock()

                const result = new SleepEvent('SleepSaveEvent', new Date(), sleep).toJSON()
                assert.propertyVal(result, 'event_name', 'SleepSaveEvent')
                assert.property(result, 'timestamp')
                assert.propertyVal(result, 'type', EventType.SLEEP)
                assert.propertyVal(result.sleep, 'id', sleep.id)
                assert.propertyVal(result.sleep, 'start_time', sleep.start_time)
                assert.propertyVal(result.sleep, 'end_time', sleep.end_time)
                assert.propertyVal(result.sleep, 'duration', sleep.duration)
                assert.propertyVal(result.sleep, 'child_id', sleep.child_id)
                assert.propertyVal(result.sleep, 'type', sleep.type)
                assert.deepPropertyVal(result.sleep, 'pattern', sleep.pattern!.toJSON())
            })
        })

        context('when the sleep is undefined', () => {
            it('should return empty object', () => {
                const result = new SleepEvent('SleepSaveEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
