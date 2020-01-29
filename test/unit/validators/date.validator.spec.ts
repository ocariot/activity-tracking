import { assert } from 'chai'
import { DateValidator } from '../../../src/application/domain/validator/date.validator'
import { Strings } from '../../../src/utils/strings'

let date: string = '2019-03-11'

describe('Validators: DateValidator', () => {
    describe('validate(datetime: string)', () => {
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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT
                        .replace('{0}', '20199-03-11'))
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INVALID_DATE_FORMAT_DESC)
                }
            })
        })
    })
})
