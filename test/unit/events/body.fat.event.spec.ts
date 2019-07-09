import { assert } from 'chai'
import { BodyFat } from '../../../src/application/domain/model/body.fat'
import { BodyFatMock } from '../../mocks/body.fat.mock'
import { BodyFatEvent } from '../../../src/application/integration-event/event/body.fat.event'
import { EventType } from '../../../src/application/integration-event/event/integration.event'

describe('IntegrationEvents: BodyFatEvent', () => {
    describe('toJSON()', () => {
        context('when the BodyFat is valid', () => {
            it('should return the BodyFat event', () => {
                const body_fat: BodyFat = new BodyFatMock()

                const result = new BodyFatEvent('BodyFatSaveEvent', new Date(), body_fat).toJSON()

                assert.propertyVal(result, 'event_name', 'BodyFatSaveEvent')
                assert.property(result, 'timestamp')
                assert.propertyVal(result, 'type', EventType.BODY_FAT)
                assert.propertyVal(result.body_fat, 'id', body_fat.id)
                assert.propertyVal(result.body_fat, 'timestamp', body_fat.timestamp)
                assert.propertyVal(result.body_fat, 'value', body_fat.value)
                assert.propertyVal(result.body_fat, 'unit', body_fat.unit)
                assert.propertyVal(result.body_fat, 'child_id', body_fat.child_id)
            })
        })

        context('when the BodyFat is undefined', () => {
            it('should return empty object', () => {
                const result = new BodyFatEvent('BodyFatSaveEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
