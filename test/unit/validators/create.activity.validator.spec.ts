import { assert } from 'chai'
import { CreateActivityValidator } from '../../../src/application/domain/validator/create.activity.validator'
import { Activity } from '../../../src/application/domain/model/activity'
import { Strings } from '../../../src/utils/strings'

const activity: Activity = new Activity()
activity.start_time = new Date('2018-12-14T12:52:59Z')
activity.end_time = new Date('2018-12-14T13:12:37Z')
activity.duration = 1178000
activity.child_id = '5a62be07de34500146d9c544'

describe('Validators: CreateActivityValidator', () => {
    describe('validate(activity: Activity)', () => {
        context('when the activity has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = CreateActivityValidator.validate(activity)
                assert.equal(result, undefined)
            })
        })

        context('when the activity does not have all the required parameters (in this case missing start_time)', () => {
            it('should throw a ValidationException', () => {
                activity.start_time = undefined
                try {
                    CreateActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Activity validation failed: start_time is required!')
                }
            })
        })

        context('when the activity does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                activity.end_time = undefined
                activity.duration = undefined
                activity.child_id = ''
                try {
                    CreateActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Required fields were not provided...')
                    assert.equal(err.description, 'Activity validation failed: start_time, end_time, ' +
                        'duration, child_id is required!')
                }
            })
        })

        context('When the activity has an invalid parameter (start_time with a date newer than end_time)', () => {
            it('should throw a ValidationException', () => {
                activity.start_time = new Date('2018-12-15T12:52:59Z')
                activity.end_time = new Date('2018-12-14T13:12:37Z')
                activity.duration = 1178000
                activity.child_id = '5a62be07de34500146d9c544'
                try {
                    CreateActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Date field is invalid...')
                    assert.equal(err.description, 'Date validation failed: The end_time parameter can not contain a older date ' +
                        'than that the start_time parameter!')
                }
            })
        })

        context('When the activity has a duration that is incompatible with the start_time and end_time parameters', () => {
            it('should throw a ValidationException', () => {
                activity.start_time = new Date('2018-12-14T12:52:59Z')
                activity.duration = 11780000
                try {
                    CreateActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Duration field is invalid...')
                    assert.equal(err.description, 'Duration validation failed: Activity duration value does not match values ' +
                        'passed in start_time and end_time parameters!')
                }
            })
        })

        context('When the activity has a negative duration', () => {
            it('should throw a ValidationException', () => {
                activity.duration = -1178000
                try {
                    CreateActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Duration field is invalid...')
                    assert.equal(err.description, 'Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
                }
                activity.duration = 1178000
            })
        })

        context('When the activity has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                activity.child_id = '5a62be07de34500146d9c5442'
                try {
                    CreateActivityValidator.validate(activity)
                } catch (err) {
                    assert.equal(err.message, 'Parameter {child_id} is not in valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                activity.child_id = '5a62be07de34500146d9c544'
            })
        })
    })
})
