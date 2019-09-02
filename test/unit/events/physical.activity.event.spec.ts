import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityEvent } from '../../../src/application/integration-event/event/physical.activity.event'
import { EventType } from '../../../src/application/integration-event/event/integration.event'
import { PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'
// import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'

describe('IntegrationEvents: PhysicalActivityEvent', () => {
    describe('toJSON()', () => {
        context('when the activity is valid', () => {
            it('should return the activity save event', () => {
                const activity: PhysicalActivity = new PhysicalActivityMock()

                const result = new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(), activity).toJSON()
                assert.propertyVal(result, 'event_name', 'PhysicalActivitySaveEvent')
                assert.property(result, 'timestamp')
                assert.propertyVal(result, 'type', EventType.PHYSICAL_ACTIVITIES)
                assert.propertyVal(result.physicalactivity, 'id', activity.id)
                assert.propertyVal(result.physicalactivity, 'start_time', activity.start_time)
                assert.propertyVal(result.physicalactivity, 'end_time', activity.end_time)
                assert.propertyVal(result.physicalactivity, 'duration', activity.duration)
                assert.propertyVal(result.physicalactivity, 'child_id', activity.child_id)
                assert.propertyVal(result.physicalactivity, 'name', activity.name)
                assert.propertyVal(result.physicalactivity, 'calories', activity.calories)
                assert.deepPropertyVal(result.physicalactivity, 'heart_rate', activity.heart_rate!.toJSON())
                if (activity.levels) {
                    assert.deepPropertyVal(result.physicalactivity, 'levels',
                        activity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                }
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
