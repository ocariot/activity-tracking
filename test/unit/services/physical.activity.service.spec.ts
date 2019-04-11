import HttpStatus from 'http-status-codes'
import sinon from 'sinon'
import { assert } from 'chai'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { EventBusRabbitmqMock } from '../../mocks/event.bus.rabbitmq.mock'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { IConnectionEventBus } from '../../../src/infrastructure/port/connection.event.bus.interface'
import { IntegrationEventRepositoryMock } from '../../mocks/integration.event.repository.mock'
import { ConnectionRabbitmqMock } from '../../mocks/connection.rabbitmq.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitmqMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityService } from '../../../src/application/service/physical.activity.service'
import { IPhysicalActivityRepository } from '../../../src/application/port/physical.activity.repository.interface'
import { PhysicalActivityRepositoryMock } from '../../mocks/physical.activity.repository.mock'
import { ActivityRepoModel } from '../../../src/infrastructure/database/schema/activity.schema'
import { Strings } from '../../../src/utils/strings'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ObjectID } from 'bson'
import { ActivityLevelType } from '../../../src/application/domain/model/physical.activity.level'
import { IPhysicalActivityService } from '../../../src/application/port/physical.activity.service.interface'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { MultiStatusMock } from '../../mocks/multi.status.mock'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'

require('sinon-mongoose')

describe('Services: PhysicalActivityService', () => {
    const activity: PhysicalActivity = new PhysicalActivityMock()
    let incorrectActivity: PhysicalActivity = new PhysicalActivity()

    // Mock through JSON
    const incorrectActivityJSON: any = {
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

    // For GET route
    const activitiesArr: Array<PhysicalActivityMock> = new Array<PhysicalActivityMock>()
    for (let i = 0; i < 3; i++) {
        activitiesArr.push(new PhysicalActivityMock())
    }

    /**
     * For POST route
     */
    // Array with correct activities
    const correctActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    for (let i = 0; i < 3; i++) {
        correctActivitiesArr.push(new PhysicalActivityMock())
    }

    // Incorrect activities
    const incorrectActivity1: PhysicalActivity = new PhysicalActivity()        // Without all required fields

    const incorrectActivity2: PhysicalActivity = new PhysicalActivityMock()    // Without PhysicalActivity fields
    incorrectActivity2.name = ''
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
    incorrectActivityJSON.levels[0].duration = -(Math.floor((Math.random() * 10) * 60000))
    incorrectActivity11 = incorrectActivity11.fromJSON(incorrectActivityJSON)

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

    /**
     * Mock MultiStatus responses
     */
    // MultiStatus totally correct
    const multiStatusCorrect: MultiStatus<PhysicalActivity> = new MultiStatusMock<PhysicalActivity>(correctActivitiesArr)
    // Mixed MultiStatus
    const multiStatusMixed: MultiStatus<PhysicalActivity> = new MultiStatusMock<PhysicalActivity>(mixedActivitiesArr)
    // MultiStatus totally incorrect
    const multiStatusIncorrect: MultiStatus<PhysicalActivity> = new MultiStatusMock<PhysicalActivity>(incorrectActivitiesArr)

    const modelFake: any = ActivityRepoModel
    const activityRepo: IPhysicalActivityRepository = new PhysicalActivityRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const activityService: IPhysicalActivityService = new PhysicalActivityService(activityRepo, integrationRepo,
        eventBusRabbitmq, customLogger)

    before(async () => {
        try {
            await connectionRabbitmqPub.tryConnect(0, 500)
            await connectionRabbitmqSub.tryConnect(0, 500)
        } catch (err) {
            throw new Error('Failure on PhysicalActivityService unit test: ' + err.message)
        }
    })

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(activity: PhysicalActivity | Array<PhysicalActivity>) with PhysicalActivity argument"
     */
    describe('add(activity: PhysicalActivity | Array<PhysicalActivity>) with PhysicalActivity argument', () => {
        context('when the physical activity is correct, it still does not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should return the PhysicalActivity that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activity)
                    .chain('exec')
                    .resolves(activity)

                return activityService.add(activity)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as PhysicalActivity
                        assert.propertyVal(result, 'id', activity.id)
                        assert.propertyVal(result, 'start_time', activity.start_time)
                        assert.propertyVal(result, 'end_time', activity.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', activity.duration)
                        assert.propertyVal(result, 'child_id', activity.child_id)
                        assert.typeOf(result.name, 'string')
                        assert.propertyVal(result, 'name', activity.name)
                        assert.typeOf(result.calories, 'number')
                        assert.propertyVal(result, 'calories', activity.calories)
                        assert.propertyVal(result, 'steps', activity.steps)
                        assert.propertyVal(result, 'levels', activity.levels)
                    })
            })
        })

        context('when the physical activity is correct and it still does not exist in the repository but there is no connection ' +
            'to the RabbitMQ', () => {
            it('should return the PhysicalActivity that was saved', () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activity)
                    .chain('exec')
                    .resolves(activity)

                return activityService.add(activity)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as PhysicalActivity
                        assert.propertyVal(result, 'id', activity.id)
                        assert.propertyVal(result, 'start_time', activity.start_time)
                        assert.propertyVal(result, 'end_time', activity.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', activity.duration)
                        assert.propertyVal(result, 'child_id', activity.child_id)
                        assert.typeOf(result.name, 'string')
                        assert.propertyVal(result, 'name', activity.name)
                        assert.typeOf(result.calories, 'number')
                        assert.propertyVal(result, 'calories', activity.calories)
                        assert.propertyVal(result, 'steps', activity.steps)
                        assert.propertyVal(result, 'levels', activity.levels)
                    })
            })
        })

        context('when the physical activity is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                connectionRabbitmqPub.isConnected = true
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activity)
                    .chain('exec')
                    .rejects({ message: 'Physical Activity is already registered...' })

                return activityService.add(activity)
                    .catch(error => {
                        assert.propertyVal(error, 'message', 'Physical Activity is already registered...')
                    })
            })
        })

        context('when the physical activity is incorrect (missing all fields)', () => {
            it('should throw a ValidationException', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Activity validation failed: start_time, end_time, ' +
                                   'duration, child_id is required!' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Activity validation failed: start_time, end_time, ' +
                        'duration, child_id is required!')
                }
            })
        })

        context('when the physical activity is incorrect (missing physical activity fields)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.name = ''
                incorrectActivity.calories = undefined
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Physical Activity validation failed: name, calories is required!' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Physical Activity validation failed: name, calories is required!')
                }
            })
        })

        context('when the physical activity is incorrect (start_time with a date newer than end_time)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.start_time = new Date('2018-12-15T12:52:59Z')
                incorrectActivity.end_time = new Date('2018-12-14T13:12:37Z')
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Date field is invalid...',
                               description: 'Date validation failed: The end_time parameter can not contain ' +
                                   'a older date than that the start_time parameter!' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Date field is invalid...')
                    assert.propertyVal(err, 'description', 'Date validation failed: The end_time parameter can not contain ' +
                        'a older date than that the start_time parameter!')
                }
            })
        })

        context('when the physical activity is incorrect (the duration is incompatible with the start_time and end_time ' +
            'parameters)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.duration = 11780000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Duration validation failed: Activity duration value does not ' +
                                   'match values passed in start_time and end_time parameters!' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Duration field is invalid...')
                    assert.propertyVal(err, 'description', 'Duration validation failed: Activity duration value does not ' +
                        'match values passed in start_time and end_time parameters!')
                }
            })
        })

        context('when the physical activity is incorrect (the duration is negative)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.duration = -11780000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Activity validation failed: The value provided has a negative value!' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Duration field is invalid...')
                    assert.propertyVal(err, 'description', 'Activity validation failed: The value provided has a negative value!')
                }
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.child_id = '5a62be07de34500146d9c5442'           // Make child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the physical activity is incorrect (the calories parameter is negative)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.calories = -200
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Calories field is invalid...',
                               description: 'Physical Activity validation failed: The value provided has a negative value!' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Calories field is invalid...')
                    assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided has a negative value!')
                }
            })
        })

        context('when the physical activity is incorrect (the steps parameter is negative)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivity.calories = 200
                incorrectActivity.steps = -1000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({
                        message: 'Steps field is invalid...',
                        description: 'Physical Activity validation failed: The value provided has a negative value!'
                    })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Steps field is invalid...')
                    assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided has a negative value!')
                }
            })
        })

        context('when the physical activity is incorrect (the levels array has an item with an invalid type)', () => {
            it('should throw a ValidationException', async () => {
                // Mock through JSON
                incorrectActivityJSON.levels[0].duration = Math.floor((Math.random() * 10) * 60000)
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'The name of level provided "sedentaries" is not supported...',
                               description: 'The names of the allowed levels are: sedentary, lightly, fairly, very.' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'The name of level provided "sedentaries" is not supported...')
                    assert.propertyVal(err, 'description', 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains empty fields)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivityJSON.levels[0].name = ''
                incorrectActivityJSON.levels[0].duration = undefined
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Level are not in a format that is supported!',
                               description: 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Level are not in a format that is supported!')
                    assert.propertyVal(err, 'description', 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains negative duration)', () => {
            it('should throw a ValidationException', async () => {
                incorrectActivityJSON.levels[0].name = ActivityLevelType.SEDENTARY
                incorrectActivityJSON.levels[0].duration = -(Math.floor((Math.random() * 10) * 60000))
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Some (or several) duration field of levels array is invalid...',
                               description: 'Physical Activity Level validation failed: The value provided ' +
                                   'has a negative value!' })

                try {
                    return await activityService.add(incorrectActivity)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Some (or several) duration field of levels array is invalid...')
                    assert.propertyVal(err, 'description', 'Physical Activity Level validation failed: The value provided ' +
                        'has a negative value!')
                }
            })
        })
    })
    /**
     * Method "add(activity: PhysicalActivity | Array<PhysicalActivity>)" with Array<PhysicalActivity> argument
     */
    describe('add(activity: PhysicalActivity | Array<PhysicalActivity>) with Array<PhysicalActivity> argument', () => {
        context('when all the activities are correct, they still do not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should create each PhysicalActivity and return a response of type MultiStatus<PhysicalActivity> with the description ' +
                'of success in sending each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctActivitiesArr)
                    .chain('exec')
                    .resolves(multiStatusCorrect)

                return activityService.add(correctActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctActivitiesArr[i].id)
                            assert.propertyVal(result.success[i].item, 'start_time', correctActivitiesArr[i].start_time)
                            assert.propertyVal(result.success[i].item, 'end_time', correctActivitiesArr[i].end_time)
                            assert.typeOf(result.success[i].item.duration, 'number')
                            assert.propertyVal(result.success[i].item, 'duration', correctActivitiesArr[i].duration)
                            assert.propertyVal(result.success[i].item, 'child_id', correctActivitiesArr[i].child_id)
                            assert.typeOf(result.success[i].item.name, 'string')
                            assert.propertyVal(result.success[i].item, 'name', correctActivitiesArr[i].name)
                            assert.typeOf(result.success[i].item.calories, 'number')
                            assert.propertyVal(result.success[i].item, 'calories', correctActivitiesArr[i].calories)
                            assert.propertyVal(result.success[i].item, 'steps', correctActivitiesArr[i].steps)
                            assert.propertyVal(result.success[i].item, 'levels', correctActivitiesArr[i].levels)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the activities are correct, they still do not exist in the repository but there is no a connection ' +
            'to the RabbitMQ', () => {
            it('should save each PhysicalActivity for submission attempt later to the bus and return a response of type ' +
                'MultiStatus<PhysicalActivity> with the description of success in each one of them', () => {
                connectionRabbitmqPub.isConnected = false

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctActivitiesArr)
                    .chain('exec')
                    .resolves(multiStatusCorrect)

                return activityService.add(correctActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>
                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctActivitiesArr[i].id)
                            assert.propertyVal(result.success[i].item, 'start_time', correctActivitiesArr[i].start_time)
                            assert.propertyVal(result.success[i].item, 'end_time', correctActivitiesArr[i].end_time)
                            assert.typeOf(result.success[i].item.duration, 'number')
                            assert.propertyVal(result.success[i].item, 'duration', correctActivitiesArr[i].duration)
                            assert.propertyVal(result.success[i].item, 'child_id', correctActivitiesArr[i].child_id)
                            assert.typeOf(result.success[i].item.name, 'string')
                            assert.propertyVal(result.success[i].item, 'name', correctActivitiesArr[i].name)
                            assert.typeOf(result.success[i].item.calories, 'number')
                            assert.propertyVal(result.success[i].item, 'calories', correctActivitiesArr[i].calories)
                            assert.propertyVal(result.success[i].item, 'steps', correctActivitiesArr[i].steps)
                            assert.propertyVal(result.success[i].item, 'levels', correctActivitiesArr[i].levels)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the activities are correct but already exists in the repository', () => {
            it('should return a response of type MultiStatus<PhysicalActivity> with the description of conflict in each one of ' +
                'them', () => {
                connectionRabbitmqPub.isConnected = true

                correctActivitiesArr.forEach(elem => {
                    elem.id = '507f1f77bcf86cd799439011'
                })

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctActivitiesArr)
                    .chain('exec')
                    .resolves(multiStatusIncorrect)

                return activityService.add(correctActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>
                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.CONFLICT)
                            assert.propertyVal(result.error[i], 'message', 'Physical Activity is already registered...')
                            assert.propertyVal(result.error[i].item, 'id', correctActivitiesArr[i].id)
                            assert.propertyVal(result.error[i].item, 'start_time', correctActivitiesArr[i].start_time)
                            assert.propertyVal(result.error[i].item, 'end_time', correctActivitiesArr[i].end_time)
                            assert.typeOf(result.error[i].item.duration, 'number')
                            assert.propertyVal(result.error[i].item, 'duration', correctActivitiesArr[i].duration)
                            assert.propertyVal(result.error[i].item, 'child_id', correctActivitiesArr[i].child_id)
                            assert.typeOf(result.error[i].item.name, 'string')
                            assert.propertyVal(result.error[i].item, 'name', correctActivitiesArr[i].name)
                            assert.typeOf(result.error[i].item.calories, 'number')
                            assert.propertyVal(result.error[i].item, 'calories', correctActivitiesArr[i].calories)
                            assert.propertyVal(result.error[i].item, 'steps', correctActivitiesArr[i].steps)
                            assert.propertyVal(result.error[i].item, 'levels', correctActivitiesArr[i].levels)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })

        context('when there are correct and incorrect activities and there is a connection to the RabbitMQ', () => {
            it('should create each correct PhysicalActivity and return a response of type MultiStatus<PhysicalActivity> with ' +
                'the description of success and error in each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(mixedActivitiesArr)
                    .chain('exec')
                    .resolves(multiStatusMixed)

                return activityService.add(mixedActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>

                        assert.propertyVal(result.success[0], 'code', HttpStatus.CREATED)
                        assert.propertyVal(result.success[0].item, 'id', mixedActivitiesArr[0].id)
                        assert.propertyVal(result.success[0].item, 'start_time', mixedActivitiesArr[0].start_time)
                        assert.propertyVal(result.success[0].item, 'end_time', mixedActivitiesArr[0].end_time)
                        assert.typeOf(result.success[0].item.duration, 'number')
                        assert.propertyVal(result.success[0].item, 'duration', mixedActivitiesArr[0].duration)
                        assert.propertyVal(result.success[0].item, 'child_id', mixedActivitiesArr[0].child_id)
                        assert.typeOf(result.success[0].item.name, 'string')
                        assert.propertyVal(result.success[0].item, 'name', mixedActivitiesArr[0].name)
                        assert.typeOf(result.success[0].item.calories, 'number')
                        assert.propertyVal(result.success[0].item, 'calories', mixedActivitiesArr[0].calories)
                        assert.propertyVal(result.success[0].item, 'steps', mixedActivitiesArr[0].steps)
                        assert.propertyVal(result.success[0].item, 'levels', mixedActivitiesArr[0].levels)

                        assert.propertyVal(result.error[0], 'code', HttpStatus.BAD_REQUEST)
                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Activity validation failed: start_time, end_time, ' +
                            'duration, child_id is required!')
                    })
            })
        })

        context('when all the activities are incorrect', () => {
            it('should return a response of type MultiStatus<PhysicalActivity> with the description of error in each one of ' +
                'them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectActivitiesArr)
                    .chain('exec')
                    .resolves(multiStatusIncorrect)

                return activityService.add(incorrectActivitiesArr)
                    .then((result: PhysicalActivity | MultiStatus<PhysicalActivity>) => {
                        result = result as MultiStatus<PhysicalActivity>

                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Activity validation failed: start_time, end_time, ' +
                            'duration, child_id is required!')
                        assert.propertyVal(result.error[1], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[1], 'description', 'Physical Activity validation failed: name, calories ' +
                            'is required!')
                        assert.propertyVal(result.error[2], 'message', 'Date field is invalid...')
                        assert.propertyVal(result.error[2], 'description', 'Date validation failed: The end_time parameter can not ' +
                            'contain a older date than that the start_time parameter!')
                        assert.propertyVal(result.error[3], 'message', 'Duration field is invalid...')
                        assert.propertyVal(result.error[3], 'description', 'Duration validation failed: Activity duration value does ' +
                            'not match values passed in start_time and end_time parameters!')
                        assert.propertyVal(result.error[4], 'message', 'Duration field is invalid...')
                        assert.propertyVal(result.error[4], 'description', 'Activity validation failed: The value provided has a ' +
                            'negative value!')
                        assert.propertyVal(result.error[5], 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(result.error[5], 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        assert.propertyVal(result.error[6], 'message', 'Calories field is invalid...')
                        assert.propertyVal(result.error[6], 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                        assert.propertyVal(result.error[7], 'message', 'Steps field is invalid...')
                        assert.propertyVal(result.error[7], 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                        assert.propertyVal(result.error[8], 'message', 'The name of level provided "sedentaries" is not supported...')
                        assert.propertyVal(result.error[8], 'description', 'The names of the allowed levels are: sedentary, lightly, ' +
                            'fairly, very.')
                        assert.propertyVal(result.error[9], 'message', 'Level are not in a format that is supported!')
                        assert.propertyVal(result.error[9], 'description', 'Must have values ​​for the following levels: sedentary, ' +
                            'lightly, fairly, very.')
                        assert.propertyVal(result.error[10], 'message', 'Some (or several) duration field of levels array is invalid...')
                        assert.propertyVal(result.error[10], 'description', 'Physical Activity Level validation failed: The value ' +
                            'provided has a negative value!')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'id', incorrectActivitiesArr[i].id)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'start_time', incorrectActivitiesArr[i].start_time)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'end_time', incorrectActivitiesArr[i].end_time)
                            if (i !== 0) assert.typeOf(result.error[i].item.duration, 'number')
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'duration', incorrectActivitiesArr[i].duration)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'child_id', incorrectActivitiesArr[i].child_id)
                            if (i !== 0) assert.typeOf(result.error[i].item.name, 'string')
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'name', incorrectActivitiesArr[i].name)
                            if (i !== 0 && i !== 1) assert.typeOf(result.error[i].item.calories, 'number')
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'calories', incorrectActivitiesArr[i].calories)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'steps', incorrectActivitiesArr[i].steps)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'levels', incorrectActivitiesArr[i].levels)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })
    })
    /**
     * Method getAll(query: IQuery)
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one physical activity object in the database that matches the query filters', () => {
            it('should return an PhysicalActivity array', () => {
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(activitiesArr)

                return activityService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no physical activity object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                activity.child_id = '507f1f77bcf86cd799439011'          // Make mock return an empty array

                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<PhysicalActivityMock>())

                return activityService.getAll(query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
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
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(activity)

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
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the physical activity id is invalid', () => {
            it('should throw a ValidationException', () => {
                activity.id = '5a62be07de34500146d9c5442'       // Make activity id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the physical activity child_id is invalid', () => {
            it('should throw a ValidationException', () => {
                activity.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return activityService.getByIdAndChild(activity.id!, activity.child_id, query)
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
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(activitiesArr)

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
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<PhysicalActivityMock>())

                return activityService.getAllByChild(activity.child_id, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when the physical activity child_id is invalid', () => {
            it('should throw a ValidationException', () => {
                activity.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid again
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return activityService.getAllByChild(activity.child_id, query)
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
        context('when physical activity exists in the database', () => {
            it('should return the PhysicalActivity that was updated', () => {
                connectionRabbitmqPub.isConnected = true
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return an activity
                activity.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activity)
                    .chain('exec')
                    .resolves(activity)

                return activityService.updateByChild(activity)
                    .then(result => {
                        assert.propertyVal(result, 'id', activity.id)
                        assert.propertyVal(result, 'start_time', activity.start_time)
                        assert.propertyVal(result, 'end_time', activity.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', activity.duration)
                        assert.propertyVal(result, 'child_id', activity.child_id)
                        assert.typeOf(result.name, 'string')
                        assert.propertyVal(result, 'name', activity.name)
                        assert.typeOf(result.calories, 'number')
                        assert.propertyVal(result, 'calories', activity.calories)
                        assert.propertyVal(result, 'steps', activity.steps)
                        assert.propertyVal(result, 'levels', activity.levels)
                    })
            })
        })

        context('when physical activity does not exist in the database', () => {
            it('should return undefined', () => {
                activity.id = '5a62be07de34500146d9c544'            // Make mock return undefined
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activity)
                    .chain('exec')
                    .resolves(undefined)

                return activityService.updateByChild(activity)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when physical activity exists in the database but there is no connection to the RabbitMQ', () => {
            it('should return the PhysicalActivity that was updated and save the event that will report the update', () => {
                connectionRabbitmqPub.isConnected = false
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return an activity
                activity.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activity)
                    .chain('exec')
                    .resolves(activity)

                return activityService.updateByChild(activity)
                    .then(result => {
                        assert.propertyVal(result, 'id', activity.id)
                        assert.propertyVal(result, 'start_time', activity.start_time)
                        assert.propertyVal(result, 'end_time', activity.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', activity.duration)
                        assert.propertyVal(result, 'child_id', activity.child_id)
                        assert.typeOf(result.name, 'string')
                        assert.propertyVal(result, 'name', activity.name)
                        assert.typeOf(result.calories, 'number')
                        assert.propertyVal(result, 'calories', activity.calories)
                        assert.propertyVal(result, 'steps', activity.steps)
                        assert.propertyVal(result, 'levels', activity.levels)
                    })
            })
        })

        context('when the physical activity is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.id = '5a62be07de34500146d9c5442'           // Make activity id invalid
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
                        assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.id = '5a62be07de34500146d9c544'           // Make activity id valid
                incorrectActivity.child_id = '5a62be07de34500146d9c5442'           // Make activity child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (duration is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                incorrectActivity.duration = -11780000
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Physical Activity validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'Duration field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (calories is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.calories = -200
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Calories field is invalid...',
                               description: 'Physical Activity validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'Calories field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (steps is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.calories = 200
                incorrectActivity.steps = -1000
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Steps field is invalid...',
                               description: 'Physical Activity validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'Steps field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item with an invalid type)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivityJSON.levels[0].name = 'sedentaries'
                incorrectActivityJSON.levels[0].duration = Math.floor((Math.random() * 10) * 60000)
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'The name of level provided "sedentaries" is not supported...',
                               description: 'The names of the allowed levels are: sedentary, lightly, fairly, very.' })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
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
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Level are not in a format that is supported!',
                               description: 'Must have values ​​for the following levels: sedentary, ' +
                                   'lightly, fairly, very.' })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'Level are not in a format that is supported!')
                        assert.propertyVal(err, 'description', 'Must have values ​​for the following levels: sedentary, ' +
                            'lightly, fairly, very.')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains negative duration)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivityJSON.levels[0].name = ActivityLevelType.SEDENTARY
                incorrectActivityJSON.levels[0].duration = -(Math.floor((Math.random() * 10) * 60000))
                incorrectActivity = incorrectActivity.fromJSON(incorrectActivityJSON)
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectActivity)
                    .chain('exec')
                    .rejects({ message: 'Some (or several) duration field of levels array is invalid...',
                               description: 'Physical Activity Level validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(incorrectActivity)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'Some (or several) duration field of levels array is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity Level validation failed: The value provided ' +
                            'has a negative value!')
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
                connectionRabbitmqPub.isConnected = true
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return true
                activity.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(activity.id)
                    .chain('exec')
                    .resolves(true)

                return activityService.removeByChild(activity.id!, activity.child_id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no physical activity with the received parameters', () => {
            it('should return false', () => {
                activity.id = '5a62be07de34500146d9c544'            // Make mock return false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(activity.id)
                    .chain('exec')
                    .resolves(false)

                return activityService.removeByChild(activity.id!, activity.child_id)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when there is physical activity with the received parameters but there is no connection to the RabbitMQ', () => {
            it('should return true and save the event that will report the removal of the resource', () => {
                connectionRabbitmqPub.isConnected = false
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return true
                activity.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(activity.id)
                    .chain('exec')
                    .resolves(true)

                return activityService.removeByChild(activity.id!, activity.child_id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                connectionRabbitmqPub.isConnected = true
                incorrectActivity.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectActivity.id)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.removeByChild(incorrectActivity.id!, incorrectActivity.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectActivity = new PhysicalActivityMock()
                incorrectActivity.id = '5a62be07de34500146d9c5442'       // Make activity id invalid
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectActivity.id)
                    .chain('exec')
                    .rejects({ message: Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.removeByChild(incorrectActivity.id!, incorrectActivity.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
