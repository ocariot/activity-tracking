import { assert } from 'chai'
import { DatetimeValidator } from '../../../src/application/domain/validator/datetime.validator'
import { Strings } from '../../../src/utils/strings'

let date: string = '2018-12-14T12:52:59Z'

describe('Validators: DatetimeValidator', () => {
    describe('validate(datetime: string)', () => {
        context('when the date is valid (for the scenario of physical activities, sleep and environment)', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = DatetimeValidator.validate(date)
                assert.equal(result, undefined)
            })
        })

        context('when the date is invalid (for the scenario of physical activities, sleep and environment)', () => {
            it('should throw a ValidationException', () => {
                date = '20199-03-11'
                try {
                    DatetimeValidator.validate(date)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT
                        .replace('{0}', '20199-03-11'))
                    assert.equal(err.description, Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT_DESC)
                }
            })
        })
    })
})
