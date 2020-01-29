import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { BodyFat } from '../../../src/application/domain/model/body.fat'
import { BodyFatMock } from '../../mocks/body.fat.mock'
import { CreateBodyFatValidator } from '../../../src/application/domain/validator/create.body.fat.validator'

const bodyFat: BodyFat = new BodyFatMock()
const type_aux: string = bodyFat.type!

describe('Validators: CreateBodyFatValidator', () => {
    describe('validate(body_fat: BodyFat)', () => {
        context('when the bodyFat has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreateBodyFatValidator.validate(bodyFat)
                assert.equal(result, undefined)
            })
        })

        context('when the bodyFat does not have all the required parameters (in this case missing type)', () => {
            after(() => {
                bodyFat.type = type_aux
            })
            it('should throw a ValidationException', () => {
                bodyFat.type = undefined
                try {
                    CreateBodyFatValidator.validate(bodyFat)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'type'))
                }
            })
        })

        context('when the bodyFat does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                bodyFat.type = undefined
                bodyFat.timestamp = undefined
                bodyFat.value = undefined
                bodyFat.unit = undefined
                bodyFat.child_id = undefined
                try {
                    CreateBodyFatValidator.validate(bodyFat)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'type, timestamp, value, unit, child_id'))
                }
            })
        })

        context('when the bodyFat has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                bodyFat.child_id = '5a62be07de34500146d9c5442'
                try {
                    CreateBodyFatValidator.validate(bodyFat)
                } catch (err) {
                    assert.equal(err.message, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })
    })
})
