import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'
import { ObjectID } from 'bson'
import { Strings } from '../../../src/utils/strings'
import { UpdatePhysicalActivityValidator } from '../../../src/application/domain/validator/update.physical.activity.validator'

const activity: PhysicalActivity = new PhysicalActivity()
activity.id = '5a62be07de34500146d9c544'
activity.start_time = new Date('2018-08-18T01:40:30Z')
activity.end_time = new Date('2018-08-18T09:52:30Z')
activity.duration = 29520000
activity.child_id = '5a62be07de34500146d9c544'
activity.name = 'walk'
activity.calories = 200
activity.steps = 1000
activity.levels = [new PhysicalActivityLevel(ActivityLevelType.SEDENTARY, Math.floor((Math.random() * 10) * 60000)),
    new PhysicalActivityLevel(ActivityLevelType.LIGHTLY, Math.floor((Math.random() * 10) * 60000)),
    new PhysicalActivityLevel(ActivityLevelType.FAIRLY, Math.floor((Math.random() * 10) * 60000)),
    new PhysicalActivityLevel(ActivityLevelType.VERY, Math.floor((Math.random() * 10) * 60000))]

describe('Validators: UpdatePhysicalActivity', () => {
    describe('validate(physicalActivity: PhysicalActivity)', () => {
        /**
         * Activity parameters
         */
        context('when the physical activity has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = UpdatePhysicalActivityValidator.validate(activity)
                assert.equal(result, undefined)
            })
        })

        context('When the physical activity has an invalid child_id', () => {
            it('should throw a ValidationException', () => {
                activity.child_id = '5a62be07de34500146d9c5442'
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Parameter {child_id} is not in valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                activity.child_id = '5a62be07de34500146d9c544'
            })
        })

        context('When the physical activity has an invalid id', () => {
            it('should throw a ValidationException', () => {
                activity.id = '5a62be07de34500146d9c5442'
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Parameter {physicalactivity_id} is not in valid format!')
                    assert.equal(err.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
                activity.id = '5a62be07de34500146d9c544'
            })
        })

        context('When the physical activity has a negative duration', () => {
            it('should throw a ValidationException', () => {
                activity.duration = -1178000
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Duration field is invalid...')
                    assert.equal(err.description, 'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
                }
                activity.duration = 1178000
            })
        })
        /**
         * PhysicalActivity parameters
         */
        context('when the physical activity has an invalid parameter (negative calories)', () => {
            it('should throw a ValidationException', () => {
                activity.calories = -200
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Calories field is invalid...')
                    assert.equal(err.description, 'Physical Activity validation failed: The value provided has a negative value!')
                }
                activity.calories = 200
            })
        })

        context('when the physical activity has an invalid parameter (negative steps)', () => {
            it('should throw a ValidationException', () => {
                activity.steps = -1000
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Steps field is invalid...')
                    assert.equal(err.description, 'Physical Activity validation failed: The value provided has a negative value!')
                }
                activity.steps = 1000
            })
        })

        context('when the physical activity has an invalid level (invalid type)', () => {
            it('should throw a ValidationException', () => {
                // Mock through JSON
                const activityJSON: any = {
                    id: new ObjectID(),
                    start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
                    end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
                    duration: 1178000,
                    child_id: '5a62be07de34500146d9c544',
                    name: 'walk',
                    calories: 200,
                    steps: 1000,
                    levels: [
                        {
                            name: 'sedentaries',
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.LIGHTLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ]
                }

                let activityTest: PhysicalActivity = new PhysicalActivity()
                activityTest = activityTest.fromJSON(activityJSON)

                try {
                    UpdatePhysicalActivityValidator.validate(activityTest)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'The name of level provided "sedentaries" is not supported...')
                    assert.equal(err.description, 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity has an invalid level (missing one of the fields, in this case lightly)', () => {
            it('should throw a ValidationException', () => {
                // Mock through JSON
                const activityJSON: any = {
                    id: new ObjectID(),
                    start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
                    end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
                    duration: 1178000,
                    child_id: '5a62be07de34500146d9c544',
                    name: 'walk',
                    calories: 200,
                    steps: 1000,
                    levels: [
                        {
                            name: ActivityLevelType.SEDENTARY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: '',
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ]
                }

                let activityTest: PhysicalActivity = new PhysicalActivity()
                activityTest = activityTest.fromJSON(activityJSON)

                try {
                    UpdatePhysicalActivityValidator.validate(activityTest)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Level are not in a format that is supported!')
                    assert.equal(err.description, 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity has an invalid level (there is a negative duration)', () => {
            it('should throw a ValidationException', () => {
                activity.levels![1].duration = -100
                try {
                    UpdatePhysicalActivityValidator.validate(activity)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.equal(err.message, 'Some (or several) duration field of levels array is invalid...')
                    assert.equal(err.description, 'Physical Activity Level validation failed: The value provided has a negative value!')
                }
                activity.levels![1].duration = Math.floor((Math.random() * 10) * 60000)
            })
        })
    })
})
