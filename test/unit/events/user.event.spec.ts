import { assert } from 'chai'
import { User } from '../../../src/application/domain/model/user'
import { UserEvent } from '../../../src/application/integration-event/event/user.event'
import { UserMock } from '../../mocks/user.mock'
import { EventType } from '../../../src/application/integration-event/event/integration.event'

describe('IntegrationEvents: UserEvent', () => {
    describe('toJSON()', () => {
        context('when the user is valid', () => {
            it('should return the sleep save event', () => {
                const user: User = new UserMock()

                const result = new UserEvent('UserDeleteEvent', new Date(), user).toJSON()
                assert.propertyVal(result, 'event_name', 'UserDeleteEvent')
                assert.property(result, 'timestamp')
                assert.propertyVal(result, 'type', EventType.USERS)
                assert.propertyVal(result.user, 'id', user.id)
            })
        })

        context('when the user is undefined', () => {
            it('should return empty object', () => {
                const result = new UserEvent('UserDeleteEvent', new Date(), undefined).toJSON()
                assert.isEmpty(result)
            })
        })
    })
})
