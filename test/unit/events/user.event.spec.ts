import { assert } from 'chai'
import { User } from '../../../src/application/domain/model/user'
import { UserEvent } from '../../../src/application/integration-event/event/user.event'

describe('IntegrationEvents: UserEvent', () => {
    describe('toJSON()', () => {
        context('when the user is valid', () => {
            it('should return the sleep save event', () => {
                const user: User = new User()
                user.id = '5a62be07de34500146d9c544'

                const result = new UserEvent('UserDeleteEvent', new Date(), user).toJSON()
                assert.propertyVal(result, 'event_name', 'UserDeleteEvent')
                assert.property(result, 'timestamp')
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
