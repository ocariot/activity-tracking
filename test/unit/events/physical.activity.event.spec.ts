import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityEvent } from '../../../src/application/integration-event/event/physical.activity.event'

describe('IntegrationEvents: PhysicalActivityEvent', () => {
    describe('toJSON()', () => {
        context('when the activity is valid', () => {
            it('should return the activity save event', () => {
                const activity: PhysicalActivity = new PhysicalActivityMock()

                const result = new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(), activity).toJSON()
                assert.propertyVal(result, 'event_name', 'PhysicalActivitySaveEvent')
                assert.property(result, 'timestamp')
                assert.property(result, 'physicalactivity')
            })

            context('when the activity is undefined', () => {
                it('should return empty object', () => {
                    const result = new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(), undefined).toJSON()
                    assert.isObject(result)
                    assert.isEmpty(result)
                })
            })
        })
    })
})
