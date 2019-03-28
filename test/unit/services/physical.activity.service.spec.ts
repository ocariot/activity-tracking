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
// import { Strings } from '../../../src/utils/strings'

require('sinon-mongoose')

describe('Services: PhysicalActivityService', () => {
    const activity: PhysicalActivity = new PhysicalActivityMock()
    let activityIncorrect: PhysicalActivity = new PhysicalActivity()

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

    // Mock activities array
    const activitiesArr: Array<PhysicalActivityMock> = new Array<PhysicalActivityMock>()
    for (let i = 0; i < 3; i++) {
        activitiesArr.push(new PhysicalActivityMock())
    }

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

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method "add(activity: PhysicalActivity)"
     */
    describe('add(activity: PhysicalActivity)', () => {
        context('when the physical activity is correct, it still does not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should return the PhysicalActivity that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activity)
                    .resolves(activity)

                return activityService.add(activity)
                    .then(result => {
                        assert(result.id, 'PhysicalActivity id (id of entity class) must not be undefined')
                        assert.propertyVal(result, 'id', activity.id)
                        assert(result.start_time, 'start_time must not be undefined')
                        assert.propertyVal(result, 'start_time', activity.start_time)
                        assert(result.end_time, 'end_time must not be undefined')
                        assert.propertyVal(result, 'end_time', activity.end_time)
                        assert(result.duration, 'duration must not be undefined')
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', activity.duration)
                        assert(result.child_id, 'child_id must not be undefined')
                        assert.propertyVal(result, 'child_id', activity.child_id)
                        assert(result.name, 'name must not be undefined')
                        assert.typeOf(result.name, 'string')
                        assert.propertyVal(result, 'name', activity.name)
                        assert(result.calories, 'calories must not be undefined')
                        assert.typeOf(result.calories, 'number')
                        assert.propertyVal(result, 'calories', activity.calories)
                        assert.propertyVal(result, 'steps', activity.steps)
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
                    .resolves(activity)

                return activityService.add(activity)
                    .then(result => {
                        assert(result.id, 'PhysicalActivity id (id of entity class) must not be undefined')
                        assert.propertyVal(result, 'id', activity.id)
                        assert(result.start_time, 'start_time must not be undefined')
                        assert.propertyVal(result, 'start_time', activity.start_time)
                        assert(result.end_time, 'end_time must not be undefined')
                        assert.propertyVal(result, 'end_time', activity.end_time)
                        assert(result.duration, 'duration must not be undefined')
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', activity.duration)
                        assert(result.child_id, 'child_id must not be undefined')
                        assert.propertyVal(result, 'child_id', activity.child_id)
                        assert(result.name, 'name must not be undefined')
                        assert.typeOf(result.name, 'string')
                        assert.propertyVal(result, 'name', activity.name)
                        assert(result.calories, 'calories must not be undefined')
                        assert.typeOf(result.calories, 'number')
                        assert.propertyVal(result, 'calories', activity.calories)
                        assert.propertyVal(result, 'steps', activity.steps)
                    })
            })
        })

        context('when the physical activity is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return true
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activity)
                    .rejects({ message: 'Physical Activity is already registered...' })

                return activityService.add(activity)
                    .catch(error => {
                        assert.property(error, 'message')
                        assert.propertyVal(error, 'message', 'Physical Activity is already registered...')
                    })
            })
        })

        context('when the physical activity is incorrect (missing all fields)', () => {
            it('should throw a ValidationException', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Activity validation failed: start_time, end_time, ' +
                                   'duration, child_id is required!' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Activity validation failed: start_time, end_time, ' +
                        'duration, child_id is required!')
                }
            })
        })

        context('when the physical activity is incorrect (missing physical activity fields)', () => {
            it('should throw a ValidationException', async () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.name = ''
                activityIncorrect.calories = undefined
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Physical Activity validation failed: name, calories is required!' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Physical Activity validation failed: name, calories is required!')
                }
            })
        })

        context('when the physical activity is incorrect (start_time with a date newer than end_time)', () => {
            it('should throw a ValidationException', async () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.start_time = new Date('2018-12-15T12:52:59Z')
                activityIncorrect.end_time = new Date('2018-12-14T13:12:37Z')
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Date field is invalid...',
                               description: 'Date validation failed: The end_time parameter can not contain ' +
                                   'a older date than that the start_time parameter!' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Date field is invalid...')
                    assert.propertyVal(err, 'description', 'Date validation failed: The end_time parameter can not contain ' +
                        'a older date than that the start_time parameter!')
                }
            })
        })

        context('when the physical activity is incorrect (the duration is incompatible with the start_time and end_time ' +
            'parameters)', () => {
            it('should throw a ValidationException', async () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.duration = 11780000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Duration validation failed: Activity duration value does not ' +
                                   'match values passed in start_time and end_time parameters!' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Duration field is invalid...')
                    assert.propertyVal(err, 'description', 'Duration validation failed: Activity duration value does not ' +
                        'match values passed in start_time and end_time parameters!')
                }
            })
        })

        context('when the physical activity is incorrect (the duration is negative)', () => {
            it('should throw a ValidationException', async () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.duration = -11780000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Activity validation failed: The value provided has a negative value!' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Duration field is invalid...')
                    assert.propertyVal(err, 'description', 'Activity validation failed: The value provided has a negative value!')
                }
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', async () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.child_id = '5a62be07de34500146d9c5442'           // Make child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the physical activity is incorrect (the calories parameter is negative)', () => {
            it('should throw a ValidationException', async () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.calories = -200
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Calories field is invalid...',
                               description: 'Physical Activity validation failed: The value provided has a negative value!' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Calories field is invalid...')
                    assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided has a negative value!')
                }
            })
        })

        context('when the physical activity is incorrect (the steps parameter is negative)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect.calories = 200
                activityIncorrect.steps = 1000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .rejects({ message: 'Steps field is invalid...',
                               description: 'Physical Activity validation failed: The value provided has a negative value!' })

                try {
                    return activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Steps field is invalid...')
                    assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided has a negative value!')
                }
            })
        })

        context('when the physical activity is incorrect (the levels array has an item with an invalid type)', () => {
            it('should throw a ValidationException', async () => {
                // Mock through JSON
                activityIncorrect = activityIncorrect.fromJSON(activityJSON)
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'The name of level provided "sedentaries" is not supported...',
                               description: 'The names of the allowed levels are: sedentary, lightly, fairly, very.' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'The name of level provided "sedentaries" is not supported...')
                    assert.propertyVal(err, 'description', 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains empty fields)', () => {
            it('should throw a ValidationException', async () => {
                activityJSON.levels[0].name = ''
                activityJSON.levels[0].duration = undefined
                activityIncorrect = activityIncorrect.fromJSON(activityJSON)
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Level are not in a format that is supported!',
                               description: 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Level are not in a format that is supported!')
                    assert.propertyVal(err, 'description', 'Must have values ​​for the following levels: sedentary, lightly, fairly, very.')
                }
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains negative duration)', () => {
            it('should throw a ValidationException', async () => {
                activityJSON.levels[0].name = ActivityLevelType.SEDENTARY
                activityJSON.levels[0].duration = -(Math.floor((Math.random() * 10) * 60000))
                activityIncorrect = activityIncorrect.fromJSON(activityJSON)
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Some (or several) duration field of levels array is invalid...',
                               description: 'Physical Activity Level validation failed: The value provided ' +
                                   'has a negative value!' })

                try {
                    return await activityService.add(activityIncorrect)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Some (or several) duration field of levels array is invalid...')
                    assert.propertyVal(err, 'description', 'Physical Activity Level validation failed: The value provided ' +
                        'has a negative value!')
                }
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
                    .resolves(activitiesArr)

                return activityService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
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
                    .resolves(new Array<PhysicalActivityMock>())

                return activityService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
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
                    .rejects({ message: Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
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
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return activityService.getByIdAndChild(activity.id!, activity.child_id, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
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
                    .resolves(activitiesArr)

                return activityService.getAllByChild(activity.child_id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
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
                    .resolves(new Array<PhysicalActivityMock>())

                return activityService.getAllByChild(activity.child_id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
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
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return activityService.getAllByChild(activity.child_id, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
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
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return an activity
                activity.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activity)
                    .resolves(activity)

                return activityService.updateByChild(activity)
                    .then(result => {
                        assert(result, 'result must not be undefined')
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
                    .resolves(undefined)

                return activityService.updateByChild(activity)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the physical activity is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect.id = '5a62be07de34500146d9c5442'           // Make activity id invalid
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect.id = '5a62be07de34500146d9c544'           // Make activity id valid
                activityIncorrect.child_id = '5a62be07de34500146d9c5442'           // Make activity child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (duration is negative)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                activityIncorrect.duration = -11780000
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Physical Activity validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Duration field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (calories is negative)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.calories = -200
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Calories field is invalid...',
                               description: 'Physical Activity validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Calories field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (steps is negative)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.calories = 200
                activityIncorrect.steps = -1000
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Steps field is invalid...',
                               description: 'Physical Activity validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Steps field is invalid...')
                        assert.propertyVal(err, 'description', 'Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item with an invalid type)', () => {
            it('should throw a ValidationException', () => {
                activityJSON.levels[0].name = 'sedentaries'
                activityJSON.levels[0].duration = Math.floor((Math.random() * 10) * 60000)
                activityIncorrect = activityIncorrect.fromJSON(activityJSON)
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'The name of level provided "sedentaries" is not supported...',
                               description: 'The names of the allowed levels are: sedentary, lightly, fairly, very.' })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'The name of level provided "sedentaries" is not supported...')
                        assert.propertyVal(err, 'description', 'The names of the allowed levels are: sedentary, lightly, fairly, very.')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains empty fields)', () => {
            it('should throw a ValidationException', () => {
                activityJSON.levels[0].name = ''
                activityJSON.levels[0].duration = undefined
                activityIncorrect = activityIncorrect.fromJSON(activityJSON)
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Level are not in a format that is supported!',
                               description: 'Must have values ​​for the following levels: sedentary, ' +
                                   'lightly, fairly, very.' })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Level are not in a format that is supported!')
                        assert.propertyVal(err, 'description', 'Must have values ​​for the following levels: sedentary, ' +
                            'lightly, fairly, very.')
                    })
            })
        })

        context('when the physical activity is incorrect (the levels array has an item that contains negative duration)', () => {
            it('should throw a ValidationException', () => {
                activityJSON.levels[0].name = ActivityLevelType.SEDENTARY
                activityJSON.levels[0].duration = -(Math.floor((Math.random() * 10) * 60000))
                activityIncorrect = activityIncorrect.fromJSON(activityJSON)
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(activityIncorrect)
                    .rejects({ message: 'Some (or several) duration field of levels array is invalid...',
                               description: 'Physical Activity Level validation failed: The value provided ' +
                                   'has a negative value!' })

                return activityService.updateByChild(activityIncorrect)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
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
                activity.id = '507f1f77bcf86cd799439011'            // Make mock return true
                activity.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(activity.id)
                    .resolves(true)

                return activityService.removeByChild(activity.id!, activity.child_id)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isBoolean(result)
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no physical activity with the received parameters', () => {
            it('should return false', () => {
                activity.id = '5a62be07de34500146d9c544'            // Make mock return false
                const query: IQuery = new Query()
                query.filters = {
                    _id: activity.id,
                    child_id: activity.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(activity.id)
                    .resolves(false)

                return activityService.removeByChild(activity.id!, activity.child_id)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.equal(result, false)
                    })
            })
        })

        context('when the physical activity is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: activityIncorrect.id,
                    child_id: activityIncorrect.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(activityIncorrect.id)
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.removeByChild(activityIncorrect.id!, activityIncorrect.child_id)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                activityIncorrect = new PhysicalActivityMock()
                activityIncorrect.id = '5a62be07de34500146d9c5442'       // Make activity id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: activityIncorrect.id,
                    child_id: activityIncorrect.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(activityIncorrect.id)
                    .rejects({ message: Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return activityService.removeByChild(activityIncorrect.id!, activityIncorrect.child_id)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
