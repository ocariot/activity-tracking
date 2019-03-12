import { assert } from 'chai'
import { ObjectIdValidator } from '../../../src/application/domain/validator/object.id.validator'
import { Strings } from '../../../src/utils/strings'

let id: string = '5a62be07de34500146d9c544'

describe('Validators: ObjectIdValidator', () => {
    context('when the id is correct', () => {
        it('should return undefined representing the success of the validation', () => {
            const result = ObjectIdValidator.validate(id)
            assert.equal(result, undefined)
        })
    })

    context('when the id is incorrect', () => {
        it('should throw a ValidationException', () => {
            id = '5a62be07de34500146d9c5442'
            try {
                ObjectIdValidator.validate(id)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT)
                assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
            id = '5a62be07de34500146d9c544'
        })
    })
})
