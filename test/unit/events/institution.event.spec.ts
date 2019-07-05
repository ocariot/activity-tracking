import { assert } from 'chai'
import { Institution } from '../../../src/application/domain/model/institution'
import { InstitutionEvent } from '../../../src/application/integration-event/event/institution.event'
import { InstitutionMock } from '../../mocks/institution.mock'
import { EventType } from '../../../src/application/integration-event/event/integration.event'

describe('IntegrationEvents: InstitutionEvent', () => {
    describe('toJSON()', () => {
        it('should return the institution event', () => {
            const institution: Institution = new InstitutionMock()

            const result = new InstitutionEvent('InstitutionDeleteEvent', new Date(), institution).toJSON()
            assert.propertyVal(result, 'event_name', 'InstitutionDeleteEvent')
            assert.property(result, 'timestamp')
            assert.propertyVal(result, 'type', EventType.INSTITUTIONS)
            assert.propertyVal(result.institution, 'id', institution.id)
        })

        context('when the institution is undefined', () => {
            it('should return empty object', () => {
                const result = new InstitutionEvent('InstitutionDeleteEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
