import { assert } from 'chai'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { LogTypeValidator } from '../../../src/application/domain/validator/log.type.validator'
import { Strings } from '../../../src/utils/strings'

let log: Log = new Log('2019-03-11', 1000, LogType.STEPS, '5a62be07de34500146d9c544')

describe('Validators: LogTypeValidator', () => {
    describe('validate(type: LogType)', () => {
        context('when the log has the correct logType in your type parameter', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = LogTypeValidator.validate(log.type)
                assert.equal(result, undefined)
            })
        })

        context('when the log does not have the correct logType in your type parameter', () => {
            it('should throw a ValidationException', () => {
                // Mock through JSON
                const logJSON: any = {
                    date: '2019-03-11',
                    value: 1000,
                    type: 'step',
                    child_id: '5a62be07de34500146d9c544',
                }

                log = log.fromJSON(logJSON)

                try {
                    LogTypeValidator.validate(log.type)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.INVALID_FIELDS)
                    assert.equal(err.description,
                        'The names of the allowed types are: ' +
                        'steps, calories, active_minutes, lightly_active_minutes, sedentary_minutes.')
                }
            })
        })
    })
})
