import { assert } from 'chai'
import { DateRangeValidator } from '../../../src/application/domain/validator/date.range.validator'
import { Strings } from '../../../src/utils/strings'

const dateStart: string = '2018-03-11'
let dateEnd: string = '2019-03-11'

describe('Validators: DateRangeValidator', () => {
    describe('validate(dateStart: string, dateEnd: string)', () => {
        context('when the date range is valid', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = DateRangeValidator.validate(dateStart, dateEnd)
                assert.equal(result, undefined)
            })
        })

        context('when the date is invalid (for the scenario of logs)', () => {
            it('should throw a ValidationException', () => {
                dateEnd = '2019-03-17'
                try {
                    DateRangeValidator.validate(dateStart, dateEnd)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.DATE_RANGE_INVALID
                        .replace('{0}', '2018-03-11').replace('{1}', '2019-03-17'))
                    assert.equal(err.description, Strings.ERROR_MESSAGE.DATE_RANGE_EXCEED_YEAR_DESC)
                }
            })
        })
    })
})
