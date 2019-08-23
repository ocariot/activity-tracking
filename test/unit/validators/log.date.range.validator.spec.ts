import { assert } from 'chai'
import { LogDateRangeValidator } from '../../../src/application/domain/validator/log.date.range.validator'

const dateStart: string = '2018-03-11'
let dateEnd: string = '2019-03-11'

describe('Validators: LogDateRangeValidator', () => {
    describe('validate(dateStart: string, dateEnd: string)', () => {
        context('when the date range is valid', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = LogDateRangeValidator.validate(dateStart, dateEnd)
                assert.equal(result, undefined)
            })
        })

        context('when the date is invalid (for the scenario of logs)', () => {
            it('should throw a ValidationException', () => {
                dateEnd = '2019-03-17'
                try {
                    LogDateRangeValidator.validate(dateStart, dateEnd)
                } catch (err) {
                    assert.equal(err.message, 'Date range is invalid...')
                    assert.equal(err.description, 'Log dates range validation failed: ' +
                        'The period between the received dates is longer than one year')
                }
            })
        })
    })
})
