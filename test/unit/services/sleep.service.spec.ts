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
import { Strings } from '../../../src/utils/strings'
import { SleepMock } from '../../mocks/sleep.mock'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepRepoModel } from '../../../src/infrastructure/database/schema/sleep.schema'
import { ISleepService } from '../../../src/application/port/sleep.service.interface'
import { SleepService } from '../../../src/application/service/sleep.service'
import { ISleepRepository } from '../../../src/application/port/sleep.repository.interface'
import { SleepRepositoryMock } from '../../mocks/sleep.repository.mock'
import { SleepPattern, SleepPatternType } from '../../../src/application/domain/model/sleep.pattern'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { ILogger } from '../../../src/utils/custom.logger'

require('sinon-mongoose')

describe('Services: SleepService', () => {
    const sleep: Sleep = new SleepMock()
    let incorrectSleep: Sleep = new Sleep()

    // Mock sleep array
    const sleepArr: Array<SleepMock> = new Array<SleepMock>()
    for (let i = 0; i < 3; i++) {
        sleepArr.push(new SleepMock())
    }

    const modelFake: any = SleepRepoModel
    const sleepRepo: ISleepRepository = new SleepRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const sleepService: ISleepService = new SleepService(sleepRepo, integrationRepo, eventBusRabbitmq, customLogger)

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method: add(sleep: Sleep)
     */
    describe('add(sleep: Sleep)', () => {
        context('when the Sleep is correct, it still does not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should return the Sleep that was added', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(sleep)
                    .chain('exec')
                    .resolves(sleep)

                return sleepService.add(sleep)
                    .then(result => {
                        assert(result.id, 'Sleep id (id of entity class) must not be undefined')
                        assert.propertyVal(result, 'id', sleep.id)
                        assert(result.start_time, 'start_time must not be undefined')
                        assert.propertyVal(result, 'start_time', sleep.start_time)
                        assert(result.end_time, 'end_time must not be undefined')
                        assert.propertyVal(result, 'end_time', sleep.end_time)
                        assert(result.duration, 'duration must not be undefined')
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', sleep.duration)
                        assert(result.child_id, 'child_id must not be undefined')
                        assert.propertyVal(result, 'child_id', sleep.child_id)
                        assert(result.pattern, 'pattern must not be undefined')
                    })
            })
        })

        context('when the Sleep is correct and it still does not exist in the repository but there is no connection ' +
            'to the RabbitMQ', () => {
            it('should return the Sleep that was saved', () => {
                connectionRabbitmqPub.isConnected = false
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(sleep)
                    .chain('exec')
                    .resolves(sleep)

                return sleepService.add(sleep)
                    .then(result => {
                        assert(result.id, 'Sleep id (id of entity class) must not be undefined')
                        assert.propertyVal(result, 'id', sleep.id)
                        assert(result.start_time, 'start_time must not be undefined')
                        assert.propertyVal(result, 'start_time', sleep.start_time)
                        assert(result.end_time, 'end_time must not be undefined')
                        assert.propertyVal(result, 'end_time', sleep.end_time)
                        assert(result.duration, 'duration must not be undefined')
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', sleep.duration)
                        assert(result.child_id, 'child_id must not be undefined')
                        assert.propertyVal(result, 'child_id', sleep.child_id)
                        assert(result.pattern, 'pattern must not be undefined')
                    })
            })
        })

        context('when the Sleep is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                sleep.id = '507f1f77bcf86cd799439011'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(sleep)
                    .chain('exec')
                    .rejects({ message: 'Sleep is already registered...' })

                return sleepService.add(sleep)
                    .catch(error => {
                        assert.property(error, 'message')
                        assert.propertyVal(error, 'message', 'Sleep is already registered...')
                    })
            })
        })

        context('when the Sleep is incorrect (missing all fields)', () => {
            it('should throw a ValidationException', async () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Activity validation failed: start_time, end_time, duration, child_id is required!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Activity validation failed: start_time, end_time, ' +
                        'duration, child_id is required!')
                }
            })
        })

        context('when the Sleep is incorrect (missing sleep fields)', () => {
            it('should throw a ValidationException', async () => {
                incorrectSleep = new SleepMock()
                incorrectSleep.pattern = undefined
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Required fields were not provided...',
                               description: 'Sleep validation failed: pattern is required!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Sleep validation failed: pattern is required!')
                }
            })
        })

        context('when the Sleep is incorrect (start_time with a date newer than end_time)', () => {
            it('should throw a ValidationException', async () => {
                incorrectSleep = new SleepMock()
                incorrectSleep.start_time = new Date('2018-12-15T12:52:59Z')
                incorrectSleep.end_time = new Date('2018-12-14T13:12:37Z')
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Date field is invalid...',
                               description: 'Date validation failed: The end_time parameter can not contain ' +
                                   'a older date than that the start_time parameter!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Date field is invalid...')
                    assert.propertyVal(err, 'description', 'Date validation failed: The end_time parameter can not contain ' +
                        'a older date than that the start_time parameter!')
                }
            })
        })

        context('when the Sleep is incorrect (the duration is incompatible with the start_time and end_time parameters)', () => {
            it('should throw a ValidationException', async () => {
                incorrectSleep = new SleepMock()
                incorrectSleep.duration = 11780000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Duration validation failed: Activity duration value does not ' +
                                   'match values passed in start_time and end_time parameters!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Duration field is invalid...')
                    assert.propertyVal(err, 'description', 'Duration validation failed: Activity duration value does not ' +
                        'match values passed in start_time and end_time parameters!')
                }
            })
        })

        context('when the Sleep is incorrect (the duration is negative)', () => {
            it('should throw a ValidationException', async () => {
                incorrectSleep = new SleepMock()
                incorrectSleep.duration = -11780000
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Activity validation failed: The value provided has a negative value!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Duration field is invalid...')
                    assert.propertyVal(err, 'description', 'Activity validation failed: The value provided has a negative value!')
                }
            })
        })

        context('when the Sleep is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', async () => {
                incorrectSleep = new SleepMock()
                incorrectSleep.child_id = '5a62be07de34500146d9c5442'           // Make child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the Sleep is incorrect (missing data_set of pattern)', () => {
            it('should throw a ValidationException', async () => {
                incorrectSleep.child_id = '5a62be07de34500146d9c544'           // Make child_id valid
                incorrectSleep.pattern = new SleepPattern()
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Pattern are not in a format that is supported...',
                               description: 'Validation of the standard of sleep failed: data_set is required!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Pattern are not in a format that is supported...')
                    assert.propertyVal(err, 'description', 'Validation of the standard of sleep failed: data_set is required!')
                }
            })
        })

        context('when the Sleep is incorrect (the pattern has an empty data_set array)', () => {
            it('should throw a ValidationException', async () => {
                incorrectSleep.pattern!.data_set = new Array<SleepPatternDataSet>()
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Dataset are not in a format that is supported!',
                               description: 'The data_set collection must not be empty!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Dataset are not in a format that is supported!')
                    assert.propertyVal(err, 'description', 'The data_set collection must not be empty!')
                }
            })
        })

        context('when the Sleep is incorrect (missing fields of some item from the data_set array of pattern)', () => {
            it('should throw a ValidationException', async () => {
                const dataSetItemTest: SleepPatternDataSet = new SleepPatternDataSet()

                incorrectSleep.pattern!.data_set = [dataSetItemTest]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Dataset are not in a format that is supported!',
                               description: 'Validation of the sleep pattern dataset failed: ' +
                                   'data_set start_time, data_set name, data_set duration is required!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Dataset are not in a format that is supported!')
                    assert.propertyVal(err, 'description', 'Validation of the sleep pattern dataset failed: ' +
                        'data_set start_time, data_set name, data_set duration is required!')
                }
            })
        })

        context('when the Sleep is incorrect (there is a negative duration on some item from the data_set array of pattern)', () => {
            it('should throw a ValidationException', async () => {
                const dataSetItemTest: SleepPatternDataSet = new SleepPatternDataSet()
                dataSetItemTest.start_time = new Date(sleep.start_time!)
                dataSetItemTest.name = SleepPatternType.RESTLESS
                dataSetItemTest.duration = -(Math.floor(Math.random() * 5 + 1) * 60000)
                incorrectSleep.pattern!.data_set = [dataSetItemTest]
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Some (or several) duration field of sleep pattern is invalid...',
                               description: 'Sleep Pattern dataset validation failed: The value provided ' +
                                   'has a negative value!' })

                try {
                    return await sleepService.add(incorrectSleep)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', 'Some (or several) duration field of sleep pattern is invalid...')
                    assert.propertyVal(err, 'description', 'Sleep Pattern dataset validation failed: The value provided ' +
                        'has a negative value!')
                }
            })
        })
    })

    /**
     * Method: getAll(query: IQuery)
     */
    describe('getAll(query: IQuery)', () => {
        context('when there is at least one sleep object in the database that matches the query filters', () => {
            it('should return an Sleep array', () => {
                const query: IQuery = new Query()
                query.filters = {
                    _id: sleep.id,
                    child_id: sleep.child_id
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(sleepArr)

                return sleepService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                    })
            })
        })

        context('when there is no sleep object in the database that matches the query filters', () => {
            it('should return an empty array', () => {
                sleep.child_id = '507f1f77bcf86cd799439011'          // Make mock return an empty array

                const query: IQuery = new Query()
                query.filters = {
                    _id: sleep.id,
                    child_id: sleep.child_id
                }

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<SleepMock>())

                return sleepService.getAll(query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })
    })

    /**
     * Method: getByIdAndChild(sleepId: string, childId: string, query: IQuery)
     */
    describe('getByIdAndChild(sleepId: string, childId: string, query: IQuery)', () => {
        context('when there is sleep with the received parameters', () => {
            it('should return the Sleep that was found', () => {
                sleep.id = '507f1f77bcf86cd799439011'            // Make mock return a sleep
                const query: IQuery = new Query()
                query.filters = {
                    _id: sleep.id,
                    child_id: sleep.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(sleep)

                return sleepService.getByIdAndChild(sleep.id!, sleep.child_id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no sleep with the received parameters', () => {
            it('should return undefined', () => {
                sleep.id = '5a62be07de34500146d9c544'            // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = {
                    _id: sleep.id,
                    child_id: sleep.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(undefined)

                return sleepService.getByIdAndChild(sleep.id!, sleep.child_id, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the sleep id is invalid', () => {
            it('should throw a ValidationException', () => {
                sleep.id = '5a62be07de34500146d9c5442'       // Make sleep id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: sleep.id,
                    child_id: sleep.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return sleepService.getByIdAndChild(sleep.id!, sleep.child_id, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the sleep child_id is invalid', () => {
            it('should throw a ValidationException', () => {
                sleep.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: sleep.id,
                    child_id: sleep.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return sleepService.getByIdAndChild(sleep.id!, sleep.child_id, query)
                } catch (err) {
                    assert.property(err, 'message')
                    assert.property(err, 'description')
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })
    })

    // /**
    //  * Method: getAllByChild(childId: string, query: IQuery)
    //  */
    describe('getAllByChild(childId: string, query: IQuery)', () => {
        context('when there is at least one sleep associated with that childId', () => {
            it('should return a Sleep array', () => {
                sleep.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again
                const query: IQuery = new Query()
                query.filters = {
                    child_id: sleep.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(sleepArr)

                return sleepService.getAllByChild(sleep.child_id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no sleep with the received parameters', () => {
            it('should return an empty array', () => {
                sleep.child_id = '507f1f77bcf86cd799439011'        // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = {
                    child_id: sleep.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .resolves(new Array<SleepMock>())

                return sleepService.getAllByChild(sleep.child_id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when the sleep child_id is invalid', () => {
            it('should throw a ValidationException', () => {
                sleep.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid again
                const query: IQuery = new Query()
                query.filters = {
                    _id: sleep.id,
                    child_id: sleep.child_id
                }
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .withArgs(query)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                try {
                    return sleepService.getAllByChild(sleep.child_id, query)
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
     * Method: updateByChild(sleep: Sleep)
     */
    describe('updateByChild(sleep: Sleep)', () => {
        context('when sleep exists in the database', () => {
            it('should return the Sleep that was updated', () => {
                sleep.id = '507f1f77bcf86cd799439011'            // Make mock return a sleep
                sleep.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(sleep)
                    .chain('exec')
                    .resolves(sleep)

                return sleepService.updateByChild(sleep)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when sleep does not exist in the database', () => {
            it('should return undefined', () => {
                sleep.id = '5a62be07de34500146d9c544'            // Make mock return undefined
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(sleep)
                    .chain('exec')
                    .resolves(undefined)

                return sleepService.updateByChild(sleep)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the sleep is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectSleep.id = '5a62be07de34500146d9c5442'           // Make sleep id invalid
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return sleepService.updateByChild(incorrectSleep)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the sleep is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectSleep.id = '5a62be07de34500146d9c544'           // Make sleep id valid
                incorrectSleep.child_id = '5a62be07de34500146d9c5442'           // Make sleep child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return sleepService.updateByChild(incorrectSleep)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the sleep is incorrect (duration is negative)', () => {
            it('should throw a ValidationException', () => {
                incorrectSleep.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                incorrectSleep.duration = -11780000
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Duration field is invalid...',
                               description: 'Sleep validation failed: The value provided has a negative value!' })

                return sleepService.updateByChild(incorrectSleep)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Duration field is invalid...')
                        assert.propertyVal(err, 'description', 'Sleep validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when the sleep is incorrect (missing data_set of pattern)', () => {
            it('should throw a ValidationException', () => {
                incorrectSleep = new SleepMock()
                incorrectSleep.pattern = new SleepPattern()
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Pattern are not in a format that is supported...',
                               description: 'Validation of the standard of sleep failed: data_set is required!' })

                return sleepService.updateByChild(incorrectSleep)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Pattern are not in a format that is supported...')
                        assert.propertyVal(err, 'description', 'Validation of the standard of sleep failed: data_set is required!')
                    })
            })
        })

        context('when the sleep is incorrect (the pattern has an empty data_set array)', () => {
            it('should throw a ValidationException', () => {
                incorrectSleep.pattern!.data_set = new Array<SleepPatternDataSet>()
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Dataset are not in a format that is supported!',
                               description: 'The data_set collection must not be empty!' })

                return sleepService.updateByChild(incorrectSleep)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Dataset are not in a format that is supported!')
                        assert.propertyVal(err, 'description', 'The data_set collection must not be empty!')
                    })
            })
        })

        context('when the sleep is incorrect (missing fields of some item from the data_set array of pattern)', () => {
            it('should throw a ValidationException', () => {
                const dataSetItemTest: SleepPatternDataSet = new SleepPatternDataSet()

                incorrectSleep.pattern!.data_set = [dataSetItemTest]
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Dataset are not in a format that is supported!',
                               description: 'Validation of the sleep pattern dataset failed: ' +
                                   'data_set start_time, data_set name, data_set duration is required!' })

                return sleepService.updateByChild(incorrectSleep)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Dataset are not in a format that is supported!')
                        assert.propertyVal(err, 'description', 'Validation of the sleep pattern dataset failed: ' +
                            'data_set start_time, data_set name, data_set duration is required!')
                    })
            })
        })

        context('when the sleep is incorrect (there is a negative duration on some item from the data_set array of pattern)', () => {
            it('should throw a ValidationException', () => {
                const dataSetItemTest: SleepPatternDataSet = new SleepPatternDataSet()
                dataSetItemTest.start_time = new Date(sleep.start_time!)
                dataSetItemTest.name = SleepPatternType.RESTLESS
                dataSetItemTest.duration = -(Math.floor(Math.random() * 5 + 1) * 60000)
                incorrectSleep.pattern!.data_set = [dataSetItemTest]
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(incorrectSleep)
                    .chain('exec')
                    .rejects({ message: 'Some (or several) duration field of sleep pattern is invalid...',
                               description: 'Sleep Pattern dataset validation failed: The value provided ' +
                                   'has a negative value!' })

                return sleepService.updateByChild(incorrectSleep)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', 'Some (or several) duration field of sleep pattern is invalid...')
                        assert.propertyVal(err, 'description', 'Sleep Pattern dataset validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })
    })

    /**
     * Method: removeByChild(sleepId: string, childId: string)
     */
    describe('removeByChild(sleepId: string, childId: string)', () => {
        context('when there is sleep with the received parameters', () => {
            it('should return true', () => {
                sleep.id = '507f1f77bcf86cd799439011'            // Make mock return true
                sleep.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(sleep.id)
                    .chain('exec')
                    .resolves(true)

                return sleepService.removeByChild(sleep.id!, sleep.child_id)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                        assert.isBoolean(result)
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no sleep with the received parameters', () => {
            it('should return false', () => {
                sleep.id = '5a62be07de34500146d9c544'            // Make mock return false
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(sleep.id)
                    .chain('exec')
                    .resolves(false)

                return sleepService.removeByChild(sleep.id!, sleep.child_id)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.equal(result, false)
                    })
            })
        })

        context('when the sleep is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectSleep.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectSleep.id)
                    .chain('exec')
                    .rejects({ message: Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return sleepService.removeByChild(incorrectSleep.id!, incorrectSleep.child_id)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the sleep is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectSleep = new SleepMock()
                incorrectSleep.id = '5a62be07de34500146d9c5442'       // Make sleep id invalid
                sinon
                    .mock(modelFake)
                    .expects('deleteOne')
                    .withArgs(incorrectSleep.id)
                    .chain('exec')
                    .rejects({ message: Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT,
                               description: Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC })

                return sleepService.removeByChild(incorrectSleep.id!, incorrectSleep.child_id)
                    .catch (err => {
                        assert.property(err, 'message')
                        assert.property(err, 'description')
                        assert.propertyVal(err, 'message', Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
