import { assert } from 'chai'
import { CreateLogValidator } from '../../../src/application/domain/validator/create.log.validator'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { Strings } from '../../../src/utils/strings'

const log: Log = new Log('2019-03-11', 1000, LogType.STEPS, '5a62be07de34500146d9c544')

describe('Validators: CreateLog', () => {
    describe('validate(activityLog: Log)', () => {
        context('when the log has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreateLogValidator.validate(log)
                assert.equal(result, undefined)
            })
        })

        context('when the log does not have all the required parameters (in this case missing type)', () => {
            it('should throw a ValidationException', () => {
                log.type = undefined!
                try {
                    CreateLogValidator.validate(log)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Physical Activity log validation failed: type is required!')
                }
            })
        })

        context('when the log does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                log.date = undefined!
                log.value = undefined!
                log.child_id = undefined!
                try {
                    CreateLogValidator.validate(log)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Physical Activity log validation failed: type, date, value, child_id is required!')
                }
            })
        })

        context('When the log has a invalid type', () => {
            it('should throw a ValidationException', () => {
                // Mock through JSON
                const logJSON: any = {
                    date: '2019-03-11',
                    value: 1000,
                    type: 'step',
                    child_id: '5a62be07de34500146d9c544',
                }

                let logTest: Log = new Log()
                logTest = logTest.fromJSON(logJSON)

                try {
                    CreateLogValidator.validate(logTest)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'The name of type provided "step" is not supported...')
                    assert.equal(err.description, 'The names of the allowed types are: steps, calories.')
                }
            })
        })

        context('When the log has a negative value', () => {
            it('should throw a ValidationException', () => {
                log.date = '2019-03-11'
                log.value = -1000
                log.type = LogType.STEPS
                log.child_id = '5a62be07de34500146d9c544'
                try {
                    CreateLogValidator.validate(log)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Value field is invalid...')
                    assert.equal(err.description, 'Physical Activity log validation failed: The value provided has a negative value!')
                }
                log.value = 1000
            })
        })

        context('When the log has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                log.child_id = '5a62be07de34500146d9c5442'
                try {
                    CreateLogValidator.validate(log)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Parameter {child_id} is not in valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                log.child_id = '5a62be07de34500146d9c544'
            })
        })
    })
})
