import HttpStatus from 'http-status-codes'
import { assert } from 'chai'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { RabbitMQMock } from '../../mocks/rabbitmq.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitMQMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityService } from '../../../src/application/service/physical.activity.service'
import { IPhysicalActivityRepository } from '../../../src/application/port/physical.activity.repository.interface'
import { PhysicalActivityRepositoryMock } from '../../mocks/physical.activity.repository.mock'
import { Strings } from '../../../src/utils/strings'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ObjectID } from 'bson'
import { ActivityLevelType } from '../../../src/application/domain/model/physical.activity.level'
import { IPhysicalActivityService } from '../../../src/application/port/physical.activity.service.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'
import { Default } from '../../../src/utils/default'

describe('Services: PhysicalActivityService', () => {
    const activity: PhysicalActivity = new PhysicalActivityMock()
    const otherActivity: PhysicalActivity = new PhysicalActivityMock()
    otherActivity.start_time = undefined
    otherActivity.end_time = undefined
    otherActivity.duration = undefined
    otherActivity.levels = []
    let incorrectActivity: PhysicalActivity = new PhysicalActivity()

    // Mock through JSON
    const incorrectActivityJSON: any = {
        id: new ObjectID(),
        start_time: new Date('2018-12-14T12:52:59Z'),
        end_time: new Date('2018-12-14T13:12:37Z'),
        duration: 1178000,
        child_id: '5a62be07de34500146d9c544',
        name: 'walk',
        calories: 200,
        steps: 1000,
        distance: 1000,
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

    // For GET route
    const activitiesArr: Array<PhysicalActivityMock> = new Array<PhysicalActivityMock>()
    for (let i = 0; i < 3; i++) {
        activitiesArr.push(new PhysicalActivityMock())
    }

    /**
     * For POST route with multiple activities
     */
        // Array with correct activities
    const correctActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    for (let i = 0; i < 3; i++) {
        correctActivitiesArr.push(new PhysicalActivityMock())
    }

    // Incorrect activities
    const incorrectActivity1: PhysicalActivity = new PhysicalActivity()        // Without all required fields

    const incorrectActivity2: PhysicalActivity = new PhysicalActivityMock()    // Without PhysicalActivity fields
    incorrectActivity2.name = undefined
    incorrectActivity2.calories = undefined

    const incorrectActivity3: PhysicalActivity = new PhysicalActivityMock()    // start_time with a date newer than end_time
    incorrectActivity3.start_time = new Date('2018-12-15T12:52:59Z')
    incorrectActivity3.end_time = new Date('2018-12-14T13:12:37Z')

    // The duration is incompatible with the start_time and end_time parameters
    const incorrectActivity4: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity4.duration = 11780000

    const incorrectActivity5: PhysicalActivity = new PhysicalActivityMock()    // The duration is negative
    incorrectActivity5.duration = -11780000

    const incorrectActivity6: PhysicalActivity = new PhysicalActivityMock()    // child_id is invalid
    incorrectActivity6.child_id = '5a62be07de34500146d9c5442'

    const incorrectActivity7: PhysicalActivity = new PhysicalActivityMock()    // The calories parameter is negative
    incorrectActivity7.calories = -200

    const incorrectActivity8: PhysicalActivity = new PhysicalActivityMock()    // The steps parameter is negative
    incorrectActivity8.steps = -1000

    let incorrectActivity9: PhysicalActivity = new PhysicalActivityMock()    // The levels array has an item with an invalid type
    incorrectActivity9 = incorrectActivity9.fromJSON(incorrectActivityJSON)

    let incorrectActivity10: PhysicalActivity = new PhysicalActivityMock()    // The levels array has an item that contains empty fields
    incorrectActivityJSON.levels[0].name = ''
    incorrectActivityJSON.levels[0].duration = undefined
    incorrectActivity10 = incorrectActivity10.fromJSON(incorrectActivityJSON)

    // The levels array has an item that contains negative duration
    let incorrectActivity11: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON.levels[0].name = ActivityLevelType.SEDENTARY
    incorrectActivityJSON.levels[0].duration = -(Math.floor((Math.random() * 10 + 1) * 60000))
    incorrectActivity11 = incorrectActivity11.fromJSON(incorrectActivityJSON)

    // The PhysicalActivityHeartRate is empty
    const incorrectActivity12: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity12.heart_rate = new PhysicalActivityHeartRate()

    // The PhysicalActivityHeartRate average is negative
    const incorrectActivity13: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity13.heart_rate!.average = -120

    // The PhysicalActivityHeartRate is invalid (the "Fat Burn Zone" parameter is empty)
    const incorrectActivity14: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity14.heart_rate!.fat_burn_zone = new HeartRateZone()

    // The PhysicalActivityHeartRate is invalid (the "Fat Burn Zone" parameter has a negative duration)
    const incorrectActivity15: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity15.heart_rate!.fat_burn_zone!.duration = -600000

    // Array with correct and incorrect activities
    const mixedActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    mixedActivitiesArr.push(new PhysicalActivityMock())
    mixedActivitiesArr.push(incorrectActivity1)

    // Array with only incorrect activities
    const incorrectActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    incorrectActivitiesArr.push(incorrectActivity1)
    incorrectActivitiesArr.push(incorrectActivity2)
    incorrectActivitiesArr.push(incorrectActivity3)
    incorrectActivitiesArr.push(incorrectActivity4)
    incorrectActivitiesArr.push(incorrectActivity5)
    incorrectActivitiesArr.push(incorrectActivity6)
    incorrectActivitiesArr.push(incorrectActivity7)
    incorrectActivitiesArr.push(incorrectActivity8)
    incorrectActivitiesArr.push(incorrectActivity9)
    incorrectActivitiesArr.push(incorrectActivity10)
    incorrectActivitiesArr.push(incorrectActivity11)
    incorrectActivitiesArr.push(incorrectActivity12)
    incorrectActivitiesArr.push(incorrectActivity13)
    incorrectActivitiesArr.push(incorrectActivity14)
    incorrectActivitiesArr.push(incorrectActivity15)

    const activityRepo: IPhysicalActivityRepository = new PhysicalActivityRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitMQMock()
    const rabbitmq: IEventBus = new RabbitMQMock(connectionFactoryRabbitmq)
    const customLogger: ILogger = new CustomLoggerMock()

    const activityService: IPhysicalActivityService = new PhysicalActivityService(activityRepo, rabbitmq, customLogger)

    before(async () => {
        try {
            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
        } catch (err) {
            throw new Error('Failure on PhysicalActivityService unit test: ' + err.message)
        }
    })

    /**
     * Method "add(activity: PhysicalActivity | Array<PhysicalActivity>) with PhysicalActivity argument"
     */
    describe('add(activity: PhysicalActivity | Array<PhysicalActivity>) with PhysicalActivity argument', () => {
        context('when the physical activity is correct and it still does not exist in the repository', () => {
            it('should return the PhysicalActivity that was added', () => {
                return activityService.add(activity)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as PhysicalActivity
                        assert.propertyVal(result, 'id', activity.id)
                        assert.propertyVal(result, 'start_time', activity.start_time)
                        assert.propertyVal(result, 'end_time', activity.end_time)
                        assert.propertyVal(result, 'duration', activity.duration)
                        assert.propertyVal(result, 'child_id', activity.child_id)
                        assert.propertyVal(result, 'name', activity.name)
                        assert.propertyVal(result, 'calories', activity.calories)
                        assert.propertyVal(result, 'steps', activity.steps)
                        assert.propertyVal(result, 'distance', activity.distance)
                        assert.propertyVal(result, 'levels', activity.levels)
                        assert.propertyVal(result, 'heart_rate', activity.heart_rate)
                    })
            })
        })

        context('when the physical activity is correct but is not successfully created in the database', () => {
            it('should return undefined', () => {
                activity.id = '507f1f77bcf86cd799439013'            // Make return undefined in create method

                return activityService.add(activity)
                    .then((result) => {
                        assert.equal(result, undefined)
                    })
            })
        })

        context('when the physical activity is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return true in checkExist method

                return activityService.add(activity)
                    .catch(error => {
                        assert.propertyVal(error, 'message', Strings.PHYSICAL_ACTIVITY.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the physical activity is incorrect (missing all fields)', () => {
            it('should throw a ValidationException', () => {
                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: ' +
                            'start_time, end_time, duration, child_id, name, calories is required!')
                    })
            })
        })

        context('when the physical activity is incorrect (missing physical activity fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.name = undefined
                incorrectActivity.calories = undefined

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: name, calories is required!')
                    })
            })
        })

        context('when the physical activity is incorrect (start_time with a date newer than end_time)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.start_time = new Date('2018-12-15T12:52:59Z')
                incorrectActivity.end_time = new Date('2018-12-14T13:12:37Z')

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Date field is invalid...')
                        assert.propertyVal(err, 'description', 'Date validation failed: The end_time parameter can not contain ' +
                            'an older date than that the start_time parameter!')
                    })
            })
        })

        context('when the physical activity is incorrect (the duration is incompatible with the start_time and end_time ' +
            'parameters)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.duration = 11780000

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Duration field is invalid...')
                        assert.propertyVal(err, 'description', 'Duration validation failed: Activity duration value does not ' +
                            'match values passed in start_time and end_time parameters!')
                    })
            })
        })

        context('when the physical activity is incorrect (the duration is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.duration = -11780000

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Duration field is invalid...')
                        assert.propertyVal(err, 'description', 'Activity validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.child_id = '5a62be07de34500146d9c5442'           // Make child_id invalid

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (the calories parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.calories = -200

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Calories field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the steps parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.calories = 200
                incorrectActivity.steps = -1000

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Steps field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the steps parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.steps = 1000
                incorrectActivity.distance = -1000

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Distance field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item with an invalid type)', () => {
            it('should throw a ValidationException', () => {
                // Mock through JSON
                incorrectActivityJSON.levels[0].duration = Math.floor((Math.random() * 10) * 60000)
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'The name of level provided "sedentaries" is not supported...')
                        assert.propertyVal(err, 'description', 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains empty fields)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivityJSON.levels[0].name = ''
                incorrectActivityJSON.levels[0].duration = undefined
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Level are not in a format that is supported!')
                        assert.propertyVal(err, 'description', 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains negative duration)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivityJSON.levels[0].name = ActivityLevelType.SEDENTARY
                incorrectActivityJSON.levels[0].duration = -(Math.floor((Math.random() * 10 + 1) * 60000))
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)

                return activityService.add(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Some (or several) duration field of levels array is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity Level validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the PhysicalActivityHeartRate is empty)', () => {
            it('should throw a ValidationException', () => {
                return activityService.add(incorrectActivity12)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'PhysicalActivityHeartRate validation failed: ' +
                            'average, out_of_range_zone, fat_burn_zone, cardio_zone, peak_zone is required!')
                    })
            })
        })

        context('when the physical activity is incorrect (the PhysicalActivityHeartRate has a negative average parameter)', () => {
            it('should throw a ValidationException', () => {
                return activityService.add(incorrectActivity13)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Average field is invalid...')
                        assert.propertyVal(err, 'description', 'PhysicalActivityHeartRate validation failed: ' +
                            'The value provided has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate is empty)', () => {
            it('should throw a ValidationException', () => {
                return activityService.add(incorrectActivity14)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'HeartRateZone validation failed: min, max, duration is required!')
                    })
            })
        })

        context('when the physical activity is incorrect ' +
            '(the "Fat Burn Zone" parameter of PhysicalActivityHeartRate has a negative duration)', () => {
            it('should throw a ValidationException', () => {
                return activityService.add(incorrectActivity15)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Duration field is invalid...')
                        assert.propertyVal(err, 'description', 'HeartRateZone validation failed: The value provided has a negative value!')
                    })
            })
        })
    })

    /**
     * Method "add(activity: PhysicalActivity | Array<PhysicalActivity>)" with Array<PhysicalActivity> argument
     */
    describe('add(activity: PhysicalActivity | Array<PhysicalActivity>) with Array<PhysicalActivity> argument', () => {
        context('when all the activities of the array are correct and they still do not exist in the repository', () => {
            it('should create each PhysicalActivity and return a response of type MultiStatus<PhysicalActivity> with the description ' +
                'of success in sending each one of them', () => {
                return activityService.add(correctActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctActivitiesArr[i].id)
                            assert.propertyVal(result.success[i].item, 'start_time', correctActivitiesArr[i].start_time)
                            assert.propertyVal(result.success[i].item, 'end_time', correctActivitiesArr[i].end_time)
                            assert.propertyVal(result.success[i].item, 'duration', correctActivitiesArr[i].duration)
                            assert.propertyVal(result.success[i].item, 'child_id', correctActivitiesArr[i].child_id)
                            assert.propertyVal(result.success[i].item, 'name', correctActivitiesArr[i].name)
                            assert.propertyVal(result.success[i].item, 'calories', correctActivitiesArr[i].calories)
                            assert.propertyVal(result.success[i].item, 'steps', correctActivitiesArr[i].steps)
                            assert.propertyVal(result.success[i].item, 'distance', correctActivitiesArr[i].distance)
                            assert.propertyVal(result.success[i].item, 'levels', correctActivitiesArr[i].levels)
                            assert.propertyVal(result.success[i].item, 'heart_rate', correctActivitiesArr[i].heart_rate)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the activities of the array are correct but already exists in the repository', () => {
            it('should return a response of type MultiStatus<PhysicalActivity> with the description of conflict in each one of ' +
                'them', () => {
                correctActivitiesArr.forEach(elem => {
                    elem.id = '507f1f77bcf86cd799439011'
                })

                return activityService.add(correctActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.CONFLICT)
                            assert.propertyVal(result.error[i], 'message', Strings.PHYSICAL_ACTIVITY.ALREADY_REGISTERED)
                            assert.propertyVal(result.error[i].item, 'id', correctActivitiesArr[i].id)
                            assert.propertyVal(result.error[i].item, 'start_time', correctActivitiesArr[i].start_time)
                            assert.propertyVal(result.error[i].item, 'end_time', correctActivitiesArr[i].end_time)
                            assert.propertyVal(result.error[i].item, 'duration', correctActivitiesArr[i].duration)
                            assert.propertyVal(result.error[i].item, 'child_id', correctActivitiesArr[i].child_id)
                            assert.propertyVal(result.error[i].item, 'name', correctActivitiesArr[i].name)
                            assert.propertyVal(result.error[i].item, 'calories', correctActivitiesArr[i].calories)
                            assert.propertyVal(result.error[i].item, 'steps', correctActivitiesArr[i].steps)
                            assert.propertyVal(result.error[i].item, 'distance', correctActivitiesArr[i].distance)
                            assert.propertyVal(result.error[i].item, 'levels', correctActivitiesArr[i].levels)
                            assert.propertyVal(result.error[i].item, 'heart_rate', correctActivitiesArr[i].heart_rate)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })

        context('when there are correct and incorrect activities in the array', () => {
            it('should create each correct PhysicalActivity and return a response of type MultiStatus<PhysicalActivity> with ' +
                'the description of success and error in each one of them', () => {
                return activityService.add(mixedActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>

                        assert.propertyVal(result.success[0], 'code', HttpStatus.CREATED)
                        assert.propertyVal(result.success[0].item, 'id', mixedActivitiesArr[0].id)
                        assert.propertyVal(result.success[0].item, 'start_time', mixedActivitiesArr[0].start_time)
                        assert.propertyVal(result.success[0].item, 'end_time', mixedActivitiesArr[0].end_time)
                        assert.propertyVal(result.success[0].item, 'duration', mixedActivitiesArr[0].duration)
                        assert.propertyVal(result.success[0].item, 'child_id', mixedActivitiesArr[0].child_id)
                        assert.propertyVal(result.success[0].item, 'name', mixedActivitiesArr[0].name)
                        assert.propertyVal(result.success[0].item, 'calories', mixedActivitiesArr[0].calories)
                        assert.propertyVal(result.success[0].item, 'steps', mixedActivitiesArr[0].steps)
                        assert.propertyVal(result.success[0].item, 'distance', mixedActivitiesArr[0].distance)
                        assert.propertyVal(result.success[0].item, 'levels', mixedActivitiesArr[0].levels)
                        assert.propertyVal(result.success[0].item, 'heart_rate', mixedActivitiesArr[0].heart_rate)

                        assert.propertyVal(result.error[0], 'code', HttpStatus.BAD_REQUEST)
                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Physical Activity validation failed: ' +
                            'start_time, end_time, duration, child_id, name, calories is required!')
                    })
            })
        })

        context('when all the activities of the array are incorrect', () => {
            it('should return a response of type MultiStatus<PhysicalActivity> with the description of error in each one of ' +
                'them', () => {
                return activityService.add(incorrectActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>

                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Physical Activity validation failed: ' +
                            'start_time, end_time, duration, child_id, name, calories is required!')
                        assert.propertyVal(result.error[1], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[1], 'description', 'Physical Activity validation failed: ' +
                            'name, calories is required!')
                        assert.propertyVal(result.error[2], 'message', 'Date field is invalid...')
                        assert.propertyVal(result.error[2], 'description', 'Date validation failed: ' +
                            'The end_time parameter can not contain an older date than that the start_time parameter!')
                        assert.propertyVal(result.error[3], 'message', 'Duration field is invalid...')
                        assert.propertyVal(result.error[3], 'description', 'Duration validation failed: ' +
                            'Activity duration value does not match values passed in start_time and end_time parameters!')
                        assert.propertyVal(result.error[4], 'message', 'Duration field is invalid...')
                        assert.propertyVal(result.error[4], 'description', 'Activity validation failed: ' +
                            'The value provided has a negative value!')
                        assert.propertyVal(result.error[5], 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(result.error[5], 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        assert.propertyVal(result.error[6], 'message', 'Calories field is invalid...')
                        assert.propertyVal(result.error[6], 'description', 'Physical Activity validation failed: ' +
                            'The value provided has a negative value!')
                        assert.propertyVal(result.error[7], 'message', 'Steps field is invalid...')
                        assert.propertyVal(result.error[7], 'description', 'Physical Activity validation failed: ' +
                            'The value provided has a negative value!')
                        assert.propertyVal(result.error[8], 'message', 'The name of level provided "sedentaries" is not supported...')
                        assert.propertyVal(result.error[8], 'description', 'The names of the allowed levels are: ' +
                            'sedentary, lightly, fairly, very.')
                        assert.propertyVal(result.error[9], 'message', 'Level are not in a format that is supported!')
                        assert.propertyVal(result.error[9], 'description', 'Must have values ​​for the following levels: ' +
                            'sedentary, lightly, fairly, very.')
                        assert.propertyVal(result.error[10], 'message', 'Some (or several) duration field of levels array is invalid...')
                        assert.propertyVal(result.error[10], 'description', 'Physical Activity Level validation failed: ' +
                            'The value provided has a negative value!')
                        assert.propertyVal(result.error[11], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[11], 'description', 'PhysicalActivityHeartRate validation failed: ' +
                            'average, out_of_range_zone, fat_burn_zone, cardio_zone, peak_zone is required!')
                        assert.propertyVal(result.error[12], 'message', 'Average field is invalid...')
                        assert.propertyVal(result.error[12], 'description', 'PhysicalActivityHeartRate validation failed: ' +
                            'The value provided has a negative value!')
                        assert.propertyVal(result.error[13], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[13], 'description', 'HeartRateZone validation failed: ' +
                            'min, max, duration is required!')
                        assert.propertyVal(result.error[14], 'message', 'Duration field is invalid...')
                        assert.propertyVal(result.error[14], 'description', 'HeartRateZone validation failed: ' +
                            'The value provided has a negative value!')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'id', incorrectActivitiesArr[i].id)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'start_time', incorrectActivitiesArr[i].start_time)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'end_time', incorrectActivitiesArr[i].end_time)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'duration', incorrectActivitiesArr[i].duration)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'child_id', incorrectActivitiesArr[i].child_id)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'name', incorrectActivitiesArr[i].name)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'calories', incorrectActivitiesArr[i].calories)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'steps', incorrectActivitiesArr[i].steps)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'distance', incorrectActivitiesArr[i].distance)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'levels', incorrectActivitiesArr[i].levels)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'heart_rate', incorrectActivitiesArr[i].heart_rate)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })
    })

    /**
     * Method getByIdAndChild(activityId: string, childId: string, query: IQuery)
     */
    describe('getByIdAndChild(activityId: string, childId: string, query: IQuery)', () => {
        context('when there is physical activity with the received parameters', () => {
            it('should return the PhysicalActivity that was found', () => {
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return an activity
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }

                return activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no physical activity with the received parameters', () => {
            it('should return undefined', () => {
                activity.id = '5a62be07de34500146d9c544'            // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }

                return activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the physical activity id is invalid', () => {
            it('should throw a ValidationException', async () => {
                activity.id = '5a62be07de34500146d9c5442'       // Make activity id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }

                try {
                    await activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the physical activity child_id is invalid', () => {
            it('should throw a ValidationException', async () => {
                activity.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }

                try {
                    await activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })
    })

    /**
     * Method getAllByChild(childId: string, query: IQuery)
     */
    describe('getAllByChild(childId: string, query: IQuery)', () => {
        context('when there is at least one physical activity associated with that childId', () => {
            it('should return a PhysicalActivity array', () => {
                activity.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again
                const query: IQuery = new Query()
                query.filters = {
                    child_id: activity.child_id
                }

                return activityService.getAllByChild(activity.child_id, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no physical activity with the received parameters', () => {
            it('should return an empty array', () => {
                activity.child_id = '507f1f77bcf86cd799439011'        // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = {
                    child_id: activity.child_id
                }

                return activityService.getAllByChild(activity.child_id, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when the physical activity child_id is invalid', () => {
            it('should throw a ValidationException', async () => {
                activity.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid again
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }

                try {
                    await activityService.getAllByChild(activity.child_id, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })
    })

    /**
     * Method updateByChild(activity: PhysicalActivity)
     */
    describe('updateByChild(activity: PhysicalActivity)', () => {
        context('when physical activity can be successfully updated', () => {
            it('should return the PhysicalActivity that was updated', () => {
                otherActivity.id = '507f1f77bcf86cd799439012'            // Make mock return an activity

                return activityService.updateByChild(otherActivity)
                    .then(result => {
                        assert.propertyVal(result, 'id', otherActivity.id)
                        assert.propertyVal(result, 'start_time', otherActivity.start_time)
                        assert.propertyVal(result, 'end_time', otherActivity.end_time)
                        assert.propertyVal(result, 'duration', otherActivity.duration)
                        assert.propertyVal(result, 'child_id', otherActivity.child_id)
                        assert.propertyVal(result, 'name', otherActivity.name)
                        assert.propertyVal(result, 'calories', otherActivity.calories)
                        assert.propertyVal(result, 'steps', otherActivity.steps)
                        assert.propertyVal(result, 'distance', otherActivity.distance)
                        assert.propertyVal(result, 'levels', otherActivity.levels)
                        assert.propertyVal(result, 'heart_rate', otherActivity.heart_rate)
                    })
            })
        })

        context('when physical activity already exists in the database', () => {
            it('should return the PhysicalActivity that was updated', () => {
                otherActivity.id = '507f1f77bcf86cd799439011'            // Make mock return true for checkExist

                return activityService.updateByChild(otherActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.ALREADY_REGISTERED)
                    })
            })
        })

        context('when physical activity does not exist in the database', () => {
            it('should return undefined', () => {
                otherActivity.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again

                return activityService.updateByChild(otherActivity)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the physical activity is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.id = '5a62be07de34500146d9c5442'           // Make activity id invalid

                return activityService.updateByChild(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.id = '5a62be07de34500146d9c544'           // Make activity id valid
                incorrectActivity.child_id = '5a62be07de34500146d9c5442'           // Make activity child_id invalid

                return activityService.updateByChild(incorrectActivity)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (the PhysicalActivityHeartRate is empty)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity12.start_time = undefined
                incorrectActivity12.end_time = undefined
                incorrectActivity12.duration = undefined
                incorrectActivity12.levels = []
                return activityService.updateByChild(incorrectActivity12)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'PhysicalActivityHeartRate validation failed: ' +
                            'average, out_of_range_zone, fat_burn_zone, cardio_zone, peak_zone is required!')
                    })
            })
        })

        context('when the physical activity is incorrect (the PhysicalActivityHeartRate has a negative average parameter)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity13.start_time = undefined
                incorrectActivity13.end_time = undefined
                incorrectActivity13.duration = undefined
                incorrectActivity13.levels = []
                return activityService.updateByChild(incorrectActivity13)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Average field is invalid...')
                        assert.propertyVal(err, 'description', 'PhysicalActivityHeartRate validation failed: ' +
                            'The value provided has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate is empty)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity14.start_time = undefined
                incorrectActivity14.end_time = undefined
                incorrectActivity14.duration = undefined
                incorrectActivity14.levels = []
                return activityService.updateByChild(incorrectActivity14)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'HeartRateZone validation failed: min, max, duration is required!')
                    })
            })
        })

        context('when the physical activity is incorrect ' +
            '(the "Fat Burn Zone" parameter of PhysicalActivityHeartRate has a negative duration)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity15.start_time = undefined
                incorrectActivity15.end_time = undefined
                incorrectActivity15.duration = undefined
                incorrectActivity15.levels = []
                return activityService.updateByChild(incorrectActivity15)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Duration field is invalid...')
                        assert.propertyVal(err, 'description', 'HeartRateZone validation failed: The value provided has a negative value!')
                    })
            })
        })
    })

    /**
     * Method removeByChild(activityId: string, childId: string)
     */
    describe('removeByChild(activityId: string, childId: string)', () => {
        context('when there is physical activity with the received parameters', () => {
            it('should return true', () => {
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return true
                activity.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again

                return activityService.removeByChild(activity.id!, activity.child_id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no physical activity with the received parameters', () => {
            it('should return false', () => {
                activity.id = '5a62be07de34500146d9c544'            // Make mock return false

                return activityService.removeByChild(activity.id!, activity.child_id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid

                return activityService.removeByChild(incorrectActivity.id!, incorrectActivity.child_id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.id = '5a62be07de34500146d9c5442'       // Make activity id invalid

                return activityService.removeByChild(incorrectActivity.id!, incorrectActivity.child_id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('countActivities(childId: string)', () => {
        context('when there is at least one physical activity associated with the child received', () => {
            it('should return how many physical activities are associated with such child in the database', () => {
                return activityService.countActivities(activity.child_id!)
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })
})
