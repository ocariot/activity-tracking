import { ObjectID } from 'bson'
import { assert } from 'chai'
import { User } from '../../../src/application/domain/model/user'

describe('Models: User', () => {
    const userJSON: any = {
        id: new ObjectID()
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an User model', () => {
                const result = new User().fromJSON(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
            })
        })

        context('when the json is undefined', () => {
            it('should return an User model with all attributes with undefined value', () => {
                const result = new User().fromJSON(undefined)
                assert.isUndefined(result.id)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return User model', () => {
                const result = new User().fromJSON(JSON.stringify(userJSON))
                assert.propertyVal(result, 'id', userJSON.id.toHexString())
            })
        })
    })

    describe('toJSON()', () => {
        context('when the User model is correct', () => {
            it('should return a JSON from User model', () => {
                let result = new User().fromJSON(userJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', userJSON.id)
            })
        })
    })
})
