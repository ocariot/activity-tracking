import { assert } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'
import { CreateWeightValidator } from '../../../src/application/domain/validator/create.weight.validator'
import { BodyFat } from '../../../src/application/domain/model/body.fat'

const weight: Weight = new WeightMock()
const type_aux: string = weight.type!
const timestamp_aux: Date = weight.timestamp!
const value_aux: number = weight.value!
const unit_aux: string = weight.unit!
const child_id_aux: string = weight.child_id!
const body_fat_aux: BodyFat = weight.body_fat!

const incompleteWeight: Weight = new WeightMock()
incompleteWeight.body_fat = undefined

describe('Validators: CreateWeightValidator', () => {
    describe('validate(weight: Weight)', () => {
        context('when the weight has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreateWeightValidator.validate(weight)
                assert.equal(result, undefined)
            })
        })

        context('when the weight has all the required parameters with valid values, and does not have the optional parameter', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreateWeightValidator.validate(incompleteWeight)
                assert.equal(result, undefined)
            })
        })

        context('when the weight does not have all the required parameters (in this case missing type)', () => {
            after(() => {
                weight.type = type_aux
            })
            it('should throw a ValidationException', () => {
                weight.type = undefined
                try {
                    CreateWeightValidator.validate(weight)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'type'))
                }
            })
        })

        context('when the weight does not have any of the required parameters', () => {
            after(() => {
                weight.type = type_aux
                weight.timestamp = timestamp_aux
                weight.value = value_aux
                weight.unit = unit_aux
                weight.child_id = child_id_aux
            })
            it('should throw a ValidationException', () => {
                weight.type = undefined
                weight.timestamp = undefined
                weight.value = undefined
                weight.unit = undefined
                weight.child_id = undefined
                try {
                    CreateWeightValidator.validate(weight)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'type, timestamp, value, unit, child_id'))
                }
            })
        })

        context('when the weight has an invalid child_id', () => {
            after(() => {
                weight.child_id = child_id_aux
            })
            it('should throw a ValidationException', () => {
                weight.child_id = '5a62be07de34500146d9c5442'
                try {
                    CreateWeightValidator.validate(weight)
                } catch (err) {
                    assert.equal(err.message, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the bodyFat measurement of weight object has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                weight.body_fat!.child_id = '5a62be07de34500146d9c5442'
                try {
                    CreateWeightValidator.validate(weight)
                } catch (err) {
                    assert.equal(err.message, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                weight.body_fat = body_fat_aux
            })
        })

        context('when the bodyFat measurement of weight object has an invalid type', () => {
            it('should throw a ValidationException', () => {
                weight.body_fat!.child_id = '5a62be07de34500146d9c544'
                weight.body_fat!.type = 'invalidType'
                try {
                    CreateWeightValidator.validate(weight)
                } catch (err) {
                    assert.equal(err.message,
                        'The type of measurement provided "invalidtype" is not supported...')
                    assert.equal(err.description,
                        'The allowed types are: temperature, humidity, pm1, pm2.5, pm10, body_fat, weight.')
                }
                weight.body_fat = body_fat_aux
            })
        })
    })
})
