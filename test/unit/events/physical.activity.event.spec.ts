import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityEvent } from '../../../src/application/integration-event/event/physical.activity.event'

describe('IntegrationEvents: PhysicalActivityEvent', () => {
    describe('toJSON()', () => {
        context('when the activity is valid', () => {
            it('should return the sleep save event', () => {
                const activity: PhysicalActivity = new PhysicalActivityMock()

                const result = new PhysicalActivityEvent('SleepSaveEvent', new Date(), activity).toJSON()
                assert.property(result, 'event_name')
                assert.property(result, 'timestamp')
                assert.property(result, 'physicalactivity')
            })

            context('when the activity is undefined', () => {
                it('should return empty object', () => {
                    const result = new PhysicalActivityEvent('SleepSaveEvent', new Date(), undefined).toJSON()
                    assert.isObject(result)
                    assert.isEmpty(result)
                })
            })
        })
    })
})
