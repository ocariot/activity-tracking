import { assert } from 'chai'
import { LogDateValidator } from '../../../src/application/domain/validator/log.date.validator'
import { Strings } from '../../../src/utils/strings'

let date: string = '2019-03-11'

describe('Validators: LogDateValidator', () => {
    describe('validate(datetime: string)', () => {
        context('when the date is valid (for the scenario of logs)', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = LogDateValidator.validate(date)
                assert.equal(result, undefined)
            })
        })

        context('when the date is invalid (for the scenario of logs)', () => {
            it('should throw a ValidationException', () => {
                date = '20199-03-11'
                try {
                    LogDateValidator.validate(date)
                } catch (err) {
                    assert.equal(err.message, 'Datetime: 20199-03-11'.concat(Strings.ERROR_MESSAGE.INVALID_DATE))
                    assert.equal(err.description, 'Date must be in the format: yyyy-MM-dd')
                }
            })
        })
    })
})
