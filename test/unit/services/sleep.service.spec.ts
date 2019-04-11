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
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { MultiStatusMock } from '../../mocks/multi.status.mock'

require('sinon-mongoose')

describe('Services: SleepService', () => {
    const sleep: Sleep = new SleepMock()
    let incorrectSleep: Sleep = new Sleep()

    // For GET route
    const sleepArr: Array<SleepMock> = new Array<SleepMock>()
    for (let i = 0; i < 3; i++) {
        sleepArr.push(new SleepMock())
    }

    /**
     * For POST route with multiple sleep objects
     */
    // Array with correct sleep objects
    const correctSleepArr: Array<Sleep> = new Array<SleepMock>()
    for (let i = 0; i < 3; i++) {
        correctSleepArr.push(new SleepMock())
    }

    // Incorrect sleep objects
    const incorrectSleep1: Sleep = new Sleep()        // Without all required fields

    const incorrectSleep2: Sleep = new SleepMock()    // Without Sleep fields
    incorrectSleep2.pattern = undefined

    const incorrectSleep3: Sleep = new SleepMock()    // start_time with a date newer than end_time
    incorrectSleep3.start_time = new Date('2018-12-15T12:52:59Z')
    incorrectSleep3.end_time = new Date('2018-12-14T13:12:37Z')

    // The duration is incompatible with the start_time and end_time parameters
    const incorrectSleep4: Sleep = new SleepMock()
    incorrectSleep4.duration = 11780000

    const incorrectSleep5: Sleep = new SleepMock()    // The duration is negative
    incorrectSleep5.duration = -11780000

    const incorrectSleep6: Sleep = new SleepMock()    // child_id is invalid
    incorrectSleep6.child_id = '5a62be07de34500146d9c5442'

    const incorrectSleep7: Sleep = new SleepMock()    // Missing data_set of pattern
    incorrectSleep7.pattern = new SleepPattern()

    const incorrectSleep8: Sleep = new SleepMock()    // The pattern has an empty data_set array
    incorrectSleep8.pattern!.data_set = new Array<SleepPatternDataSet>()

    const incorrectSleep9: Sleep = new SleepMock()    // Missing fields of some item from the data_set array of pattern
    const dataSetItemSleep9: SleepPatternDataSet = new SleepPatternDataSet()
    incorrectSleep9.pattern!.data_set = [dataSetItemSleep9]

    const incorrectSleep10: Sleep = new SleepMock()    // There is a negative duration on some item from the data_set array of pattern
    const dataSetItemSleep10: SleepPatternDataSet = new SleepPatternDataSet()
    dataSetItemSleep10.start_time = new Date(sleep.start_time!)
    dataSetItemSleep10.name = SleepPatternType.RESTLESS
    dataSetItemSleep10.duration = -(Math.floor(Math.random() * 5 + 1) * 60000)
    incorrectSleep10.pattern!.data_set = [dataSetItemSleep10]

    // Array with correct and incorrect sleep objects
    const mixedSleepArr: Array<Sleep> = new Array<SleepMock>()
    mixedSleepArr.push(new SleepMock())
    mixedSleepArr.push(incorrectSleep1)

    // Array with only incorrect sleep objects
    const incorrectSleepArr: Array<Sleep> = new Array<SleepMock>()
    incorrectSleepArr.push(incorrectSleep1)
    incorrectSleepArr.push(incorrectSleep2)
    incorrectSleepArr.push(incorrectSleep3)
    incorrectSleepArr.push(incorrectSleep4)
    incorrectSleepArr.push(incorrectSleep5)
    incorrectSleepArr.push(incorrectSleep6)
    incorrectSleepArr.push(incorrectSleep7)
    incorrectSleepArr.push(incorrectSleep8)
    incorrectSleepArr.push(incorrectSleep9)
    incorrectSleepArr.push(incorrectSleep10)

    /**
     * Mock MultiStatus responses
     */
    // MultiStatus totally correct
    const multiStatusCorrect: MultiStatus<Sleep> = new MultiStatusMock<Sleep>(correctSleepArr)
    // Mixed MultiStatus
    const multiStatusMixed: MultiStatus<Sleep> = new MultiStatusMock<Sleep>(mixedSleepArr)
    // MultiStatus totally incorrect
    const multiStatusIncorrect: MultiStatus<Sleep> = new MultiStatusMock<Sleep>(incorrectSleepArr)

    const modelFake: any = SleepRepoModel
    const sleepRepo: ISleepRepository = new SleepRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const sleepService: ISleepService = new SleepService(sleepRepo, integrationRepo, eventBusRabbitmq, customLogger)

    before(async () => {
        try {
            await connectionRabbitmqPub.tryConnect(0, 500)
            await connectionRabbitmqSub.tryConnect(0, 500)
        } catch (err) {
            throw new Error('Failure on SleepService unit test: ' + err.message)
        }
    })

    afterEach(() => {
        sinon.restore()
    })

    /**
     * Method: add(sleep: Sleep | Array<Sleep>) with Sleep argument)
     */
    describe('add(sleep: Sleep | Array<Sleep>) with Sleep argument)', () => {
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
                    .then((result: Sleep | Array<Sleep>) => {
                        result = result as Sleep
                        assert.propertyVal(result, 'id', sleep.id)
                        assert.propertyVal(result, 'start_time', sleep.start_time)
                        assert.propertyVal(result, 'end_time', sleep.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', sleep.duration)
                        assert.propertyVal(result, 'child_id', sleep.child_id)
                        assert.propertyVal(result, 'pattern', sleep.pattern)
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
                    .then((result: Sleep | Array<Sleep>) => {
                        result = result as Sleep
                        assert.propertyVal(result, 'id', sleep.id)
                        assert.propertyVal(result, 'start_time', sleep.start_time)
                        assert.propertyVal(result, 'end_time', sleep.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', sleep.duration)
                        assert.propertyVal(result, 'child_id', sleep.child_id)
                        assert.propertyVal(result, 'pattern', sleep.pattern)
                    })
            })
        })

        context('when the Sleep is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                connectionRabbitmqPub.isConnected = true
                sleep.id = '507f1f77bcf86cd799439011'
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(sleep)
                    .chain('exec')
                    .rejects({ message: 'Sleep is already registered...' })

                return sleepService.add(sleep)
                    .catch(error => {
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
                    assert.propertyVal(err, 'message', 'Some (or several) duration field of sleep pattern is invalid...')
                    assert.propertyVal(err, 'description', 'Sleep Pattern dataset validation failed: The value provided ' +
                        'has a negative value!')
                }
            })
        })
    })

    /**
     * Method "add(sleep: Sleep | Array<Sleep>)" with Array<Sleep> argument
     */
    describe('add(sleep: Sleep | Array<Sleep>) with Array<Sleep> argument', () => {
        context('when all the sleep objects of the array are correct, they still do not exist in the repository and there is ' +
            'a connection to the RabbitMQ', () => {
            it('should create each Sleep and return a response of type MultiStatus<Sleep> with the description ' +
                'of success in sending each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctSleepArr)
                    .chain('exec')
                    .resolves(multiStatusCorrect)

                return sleepService.add(correctSleepArr)
                    .then((result: Sleep | MultiStatus<Sleep>) => {
                        result = result as MultiStatus<Sleep>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctSleepArr[i].id)
                            assert.propertyVal(result.success[i].item, 'start_time', correctSleepArr[i].start_time)
                            assert.propertyVal(result.success[i].item, 'end_time', correctSleepArr[i].end_time)
                            assert.typeOf(result.success[i].item.duration, 'number')
                            assert.propertyVal(result.success[i].item, 'duration', correctSleepArr[i].duration)
                            assert.propertyVal(result.success[i].item, 'child_id', correctSleepArr[i].child_id)
                            assert.propertyVal(result.success[i].item, 'pattern', correctSleepArr[i].pattern)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the sleep objects of the array are correct, they still do not exist in the repository but there is no ' +
            'a connection to the RabbitMQ', () => {
            it('should save each Sleep for submission attempt later to the bus and return a response of type ' +
                'MultiStatus<Sleep> with the description of success in each one of them', () => {
                connectionRabbitmqPub.isConnected = false

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctSleepArr)
                    .chain('exec')
                    .resolves(multiStatusCorrect)

                return sleepService.add(correctSleepArr)
                    .then((result: Sleep | MultiStatus<Sleep>) => {
                        result = result as MultiStatus<Sleep>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctSleepArr[i].id)
                            assert.propertyVal(result.success[i].item, 'start_time', correctSleepArr[i].start_time)
                            assert.propertyVal(result.success[i].item, 'end_time', correctSleepArr[i].end_time)
                            assert.typeOf(result.success[i].item.duration, 'number')
                            assert.propertyVal(result.success[i].item, 'duration', correctSleepArr[i].duration)
                            assert.propertyVal(result.success[i].item, 'child_id', correctSleepArr[i].child_id)
                            assert.propertyVal(result.success[i].item, 'pattern', correctSleepArr[i].pattern)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the sleep objects of the array are correct but already exists in the repository', () => {
            it('should return a response of type MultiStatus<Sleep> with the description of conflict in each one of ' +
                'them', () => {
                connectionRabbitmqPub.isConnected = true

                correctSleepArr.forEach(elem => {
                    elem.id = '507f1f77bcf86cd799439011'
                })

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(correctSleepArr)
                    .chain('exec')
                    .resolves(multiStatusIncorrect)

                return sleepService.add(correctSleepArr)
                    .then((result: Sleep | MultiStatus<Sleep>) => {
                        result = result as MultiStatus<Sleep>

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.CONFLICT)
                            assert.propertyVal(result.error[i], 'message', 'Sleep is already registered...')
                            assert.propertyVal(result.error[i].item, 'id', correctSleepArr[i].id)
                            assert.propertyVal(result.error[i].item, 'start_time', correctSleepArr[i].start_time)
                            assert.propertyVal(result.error[i].item, 'end_time', correctSleepArr[i].end_time)
                            assert.typeOf(result.error[i].item.duration, 'number')
                            assert.propertyVal(result.error[i].item, 'duration', correctSleepArr[i].duration)
                            assert.propertyVal(result.error[i].item, 'child_id', correctSleepArr[i].child_id)
                            assert.propertyVal(result.error[i].item, 'pattern', correctSleepArr[i].pattern)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })

        context('when there are correct and incorrect sleep objects in the array and there is a connection to the RabbitMQ', () => {
            it('should create each correct Sleep and return a response of type MultiStatus<Sleep> with the description of success ' +
                'and error in each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(mixedSleepArr)
                    .chain('exec')
                    .resolves(multiStatusMixed)

                return sleepService.add(mixedSleepArr)
                    .then((result: Sleep | MultiStatus<Sleep>) => {
                        result = result as MultiStatus<Sleep>

                        assert.propertyVal(result.success[0], 'code', HttpStatus.CREATED)
                        assert.propertyVal(result.success[0].item, 'id', mixedSleepArr[0].id)
                        assert.propertyVal(result.success[0].item, 'start_time', mixedSleepArr[0].start_time)
                        assert.propertyVal(result.success[0].item, 'end_time', mixedSleepArr[0].end_time)
                        assert.typeOf(result.success[0].item.duration, 'number')
                        assert.propertyVal(result.success[0].item, 'duration', mixedSleepArr[0].duration)
                        assert.propertyVal(result.success[0].item, 'child_id', mixedSleepArr[0].child_id)
                        assert.propertyVal(result.success[0].item, 'pattern', mixedSleepArr[0].pattern)

                        assert.propertyVal(result.error[0], 'code', HttpStatus.BAD_REQUEST)
                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Activity validation failed: start_time, end_time, ' +
                            'duration, child_id is required!')
                    })
            })
        })

        context('when all the sleep objects of the array are incorrect', () => {
            it('should return a response of type MultiStatus<Sleep> with the description of error in each one of them', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(incorrectSleepArr)
                    .chain('exec')
                    .resolves(multiStatusIncorrect)

                return sleepService.add(incorrectSleepArr)
                    .then((result: Sleep | MultiStatus<Sleep>) => {
                        result = result as MultiStatus<Sleep>

                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Activity validation failed: start_time, end_time, ' +
                            'duration, child_id is required!')
                        assert.propertyVal(result.error[1], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[1], 'description', 'Sleep validation failed: pattern is required!')
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
                        assert.propertyVal(result.error[6], 'message', 'Pattern are not in a format that is supported...')
                        assert.propertyVal(result.error[6], 'description', 'Validation of the standard of sleep failed: data_set is ' +
                            'required!')
                        assert.propertyVal(result.error[7], 'message', 'Dataset are not in a format that is supported!')
                        assert.propertyVal(result.error[7], 'description', 'The data_set collection must not be empty!')
                        assert.propertyVal(result.error[8], 'message', 'Dataset are not in a format that is supported!')
                        assert.propertyVal(result.error[8], 'description', 'Validation of the sleep pattern dataset failed: ' +
                            'data_set start_time, data_set name, data_set duration is required!')
                        assert.propertyVal(result.error[9], 'message', 'Some (or several) duration field of sleep pattern is invalid...')
                        assert.propertyVal(result.error[9], 'description', 'Sleep Pattern dataset validation failed: The value provided ' +
                            'has a negative value!')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'id', incorrectSleepArr[i].id)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'start_time', incorrectSleepArr[i].start_time)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'end_time', incorrectSleepArr[i].end_time)
                            if (i !== 0) assert.typeOf(result.error[i].item.duration, 'number')
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'duration', incorrectSleepArr[i].duration)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'child_id', incorrectSleepArr[i].child_id)
                            if (i !== 0) assert.propertyVal(result.error[i].item, 'pattern', incorrectSleepArr[i].pattern)
                        }

                        assert.isEmpty(result.success)
                    })
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
                        assert.isArray(result)
                        assert.isNotEmpty(result)
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
                        assert.propertyVal(result, 'id', sleep.id)
                        assert.propertyVal(result, 'start_time', sleep.start_time)
                        assert.propertyVal(result, 'end_time', sleep.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', sleep.duration)
                        assert.propertyVal(result, 'child_id', sleep.child_id)
                        assert.propertyVal(result, 'pattern', sleep.pattern)
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

        context('when sleep exists in the database but there is no connection to the RabbitMQ', () => {
            it('should return the Sleep that was updated and save the event that will report the update', () => {
                connectionRabbitmqPub.isConnected = false
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
                        assert.propertyVal(result, 'id', sleep.id)
                        assert.propertyVal(result, 'start_time', sleep.start_time)
                        assert.propertyVal(result, 'end_time', sleep.end_time)
                        assert.typeOf(result.duration, 'number')
                        assert.propertyVal(result, 'duration', sleep.duration)
                        assert.propertyVal(result, 'child_id', sleep.child_id)
                        assert.propertyVal(result, 'pattern', sleep.pattern)
                    })
            })
        })

        context('when the sleep is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                connectionRabbitmqPub.isConnected = true
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
                        assert.equal(result, false)
                    })
            })
        })

        context('when there is sleep with the received parameters but there is no connection to the RabbitMQ', () => {
            it('should return true and save the event that will report the removal of the resource', () => {
                connectionRabbitmqPub.isConnected = false
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
                        assert.equal(result, true)
                    })
            })
        })

        context('when the sleep is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                connectionRabbitmqPub.isConnected = true
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
                        assert.propertyVal(err, 'message', Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
