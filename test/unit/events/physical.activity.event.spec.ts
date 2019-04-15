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
                assert.propertyVal(result.physicalactivity, 'id', activity.id)
                assert.propertyVal(result.physicalactivity, 'start_time', activity.start_time!.toISOString())
                assert.propertyVal(result.physicalactivity, 'end_time', activity.end_time!.toISOString())
                assert.propertyVal(result.physicalactivity, 'duration', activity.duration)
                assert.propertyVal(result.physicalactivity, 'child_id', activity.child_id)
                assert.propertyVal(result.physicalactivity, 'name', activity.name)
                assert.propertyVal(result.physicalactivity, 'calories', activity.calories)
                if (activity.levels) assert.property(result.physicalactivity, 'levels')
            })
        })

        context('when the activity is undefined', () => {
            it('should return empty object', () => {
                const result = new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
