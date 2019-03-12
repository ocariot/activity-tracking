import { assert } from 'chai'
import { DateValidator } from '../../../src/application/domain/validator/date.validator'

let date: string = '2019-03-11'

describe('Validators: DateValidator', () => {
    context('when the date is valid (for the scenario of logs)', () => {
        it('should return undefined representing the success of the validation', () => {
            const result = DateValidator.validate(date)
            assert.equal(result, undefined)
        })
    })

    context('when the date is invalid (for the scenario of logs)', () => {
        it('should throw a ValidationException', () => {
            date = '20199-03-11'
            try {
                DateValidator.validate(date)
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Date parameter: 20199-03-11, is not in valid ISO 8601 format.')
                assert.equal(err.description, 'Date must be in the format: yyyy-MM-dd')
            }
        })
    })
})
