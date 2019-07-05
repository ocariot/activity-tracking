import { assert } from 'chai'
import { EventType } from '../../../src/application/integration-event/event/integration.event'
import { WeightEvent } from '../../../src/application/integration-event/event/weight.event'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'

describe('IntegrationEvents: WeightEvent', () => {
    describe('toJSON()', () => {
        context('when the Weight is valid', () => {
            it('should return the Weight event', () => {
                const weight: Weight = new WeightMock()

                const result = new WeightEvent('WeightSaveEvent', new Date(), weight).toJSON()

                assert.propertyVal(result, 'event_name', 'WeightSaveEvent')
                assert.property(result, 'timestamp')
                assert.propertyVal(result, 'type', EventType.WEIGHT)
                assert.propertyVal(result.weight, 'id', weight.id)
                assert.propertyVal(result.weight, 'timestamp', weight.timestamp)
                assert.propertyVal(result.weight, 'value', weight.value)
                assert.propertyVal(result.weight, 'unit', weight.unit)
                assert.propertyVal(result.weight, 'child_id', weight.child_id)
                assert.propertyVal(result.weight, 'body_fat', weight.body_fat!.value)
            })
        })

        context('when the Weight is undefined', () => {
            it('should return empty object', () => {
                const result = new WeightEvent('WeightSaveEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
