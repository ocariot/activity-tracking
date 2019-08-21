import HttpStatus from 'http-status-codes'
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
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { IWeightRepository } from '../../../src/application/port/weight.repository.interface'
import { WeightRepositoryMock } from '../../mocks/weight.repository.mock'
import { IWeightService } from '../../../src/application/port/weight.service.interface'
import { WeightService } from '../../../src/application/service/weight.service'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'
import { BodyFat } from '../../../src/application/domain/model/body.fat'
import { BodyFatMock } from '../../mocks/body.fat.mock'
import { IBodyFatRepository } from '../../../src/application/port/body.fat.repository.interface'
import { BodyFatRepositoryMock } from '../../mocks/body.fat.repository.mock'
import { MeasurementType } from '../../../src/application/domain/model/measurement'

describe('Services: WeightService', () => {
    const weight: Weight = new WeightMock()

    // For GET route
    const weightArr: Array<WeightMock> = new Array<WeightMock>()
    for (let i = 0; i < 3; i++) {
        weightArr.push(new WeightMock())
    }

    /**
     * For POST route with multiple Weight objects
     */
        // Array with correct Weight objects
    const correctWeightArr: Array<Weight> = new Array<WeightMock>()
    for (let i = 0; i < 3; i++) {
        correctWeightArr.push(new WeightMock())
    }

    // Incorrect Weight objects
    const incorrectWeight1: Weight = new Weight()           // Without all required fields
    incorrectWeight1.type = ''

    const incorrectWeight2: Weight = new WeightMock()    // child_id is invalid
    incorrectWeight2.child_id = '5a62be07de34500146d9c5442'

    const incorrectWeight3: Weight = new WeightMock()    // type is invalid
    incorrectWeight3.type = 'invalidType'

    const incorrectWeight4: Weight = new WeightMock()    // body_fat of the Weight without all required fields
    const incorrectBodyFat: BodyFat = new BodyFat()
    incorrectBodyFat.type = ''
    incorrectBodyFat.unit = undefined
    incorrectWeight4.body_fat = incorrectBodyFat

    const incorrectWeight5: Weight = new WeightMock()    // body_fat of the Weight with an invalid child_id
    const incorrectBodyFat2: BodyFat = new BodyFatMock()
    incorrectBodyFat2.child_id = '5a62be07de34500146d9c5442'
    incorrectWeight5.body_fat = incorrectBodyFat2

    const incorrectWeight6: Weight = new WeightMock()    // body_fat of the Weight with an invalid type
    const incorrectBodyFat3: BodyFat = new BodyFatMock()
    incorrectBodyFat3.type = 'invalidType'
    incorrectWeight6.body_fat = incorrectBodyFat3

    // Array with correct and incorrect Weight objects
    const mixedWeightArr: Array<Weight> = new Array<WeightMock>()
    mixedWeightArr.push(new WeightMock())
    mixedWeightArr.push(incorrectWeight1)

    // Array with only incorrect Weight objects
    const incorrectWeightArr: Array<Weight> = new Array<WeightMock>()
    incorrectWeightArr.push(incorrectWeight1)
    incorrectWeightArr.push(incorrectWeight2)
    incorrectWeightArr.push(incorrectWeight3)
    incorrectWeightArr.push(incorrectWeight4)
    incorrectWeightArr.push(incorrectWeight5)
    incorrectWeightArr.push(incorrectWeight6)

    const weightRepo: IWeightRepository = new WeightRepositoryMock()
    const bodyFatRepo: IBodyFatRepository = new BodyFatRepositoryMock()
    const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
    const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
    const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
    const customLogger: ILogger = new CustomLoggerMock()

    const weightService: IWeightService = new WeightService(weightRepo, bodyFatRepo, integrationRepo, eventBusRabbitmq, customLogger)

    before(async () => {
        try {
            await connectionRabbitmqPub.tryConnect(0, 500)
            await connectionRabbitmqSub.tryConnect(0, 500)
        } catch (err) {
            throw new Error('Failure on WeightService unit test: ' + err.message)
        }
    })

    /**
     * Method: add(weight: Weight | Array<Weight>) with Weight argument)
     */
    describe('add(weight: Weight | Array<Weight>) with Weight argument)', () => {
        context('when the Weight is correct, it still does not exist in the repository and there is a connection ' +
            'to the RabbitMQ', () => {
            it('should return the Weight that was added', () => {
                return weightService.add(weight)
                    .then((result: Weight | Array<Weight>) => {
                        result = result as Weight
                        assert.property(result, 'id')
                        assert.propertyVal(result, 'type', weight.type)
                        assert.propertyVal(result, 'timestamp', weight.timestamp)
                        assert.propertyVal(result, 'value', weight.value)
                        assert.propertyVal(result, 'unit', weight.unit)
                        assert.propertyVal(result, 'child_id', weight.child_id)
                        assert.propertyVal(result, 'body_fat', weight.body_fat)
                    })
            })
        })

        context('when the Weight is correct, your body_fat already exists and will be associated with the Weight object)', () => {
            it('should return the Weight that was added', () => {
                weight.body_fat!.child_id = '507f1f77bcf86cd799439011'

                return weightService.add(weight)
                    .then((result: Weight | Array<Weight>) => {
                        result = result as Weight
                        assert.property(result, 'id')
                        assert.propertyVal(result, 'type', weight.type)
                        assert.propertyVal(result, 'timestamp', weight.timestamp)
                        assert.propertyVal(result, 'value', weight.value)
                        assert.propertyVal(result, 'unit', weight.unit)
                        assert.propertyVal(result, 'child_id', weight.child_id)
                        assert.propertyVal(result, 'body_fat', weight.body_fat)
                    })
            })
        })

        context('when the Weight is correct and it still does not exist in the repository but there is no connection ' +
            'to the RabbitMQ', () => {
            it('should return the Weight that was saved', () => {
                connectionRabbitmqPub.isConnected = false

                return weightService.add(weight)
                    .then((result: Weight | Array<Weight>) => {
                        result = result as Weight
                        assert.propertyVal(result, 'id', weight.id)
                        assert.propertyVal(result, 'type', weight.type)
                        assert.propertyVal(result, 'timestamp', weight.timestamp)
                        assert.propertyVal(result, 'value', weight.value)
                        assert.propertyVal(result, 'unit', weight.unit)
                        assert.propertyVal(result, 'child_id', weight.child_id)
                        assert.propertyVal(result, 'body_fat', weight.body_fat)
                    })
            })
        })

        context('when the Weight is correct and it still does not exist in the repository, there is no connection ' +
            'to the RabbitMQ but the event could not be saved', () => {
            it('should return the Weight because the current implementation does not throw an exception, it just prints a log', () => {
                weight.id = '507f1f77bcf86cd799439012'           // Make mock throw an error in IntegrationEventRepository

                return weightService.add(weight)
                    .then((result: Weight | Array<Weight>) => {
                        result = result as Weight
                        assert.propertyVal(result, 'id', weight.id)
                        assert.propertyVal(result, 'type', weight.type)
                        assert.propertyVal(result, 'timestamp', weight.timestamp)
                        assert.propertyVal(result, 'value', weight.value)
                        assert.propertyVal(result, 'unit', weight.unit)
                        assert.propertyVal(result, 'child_id', weight.child_id)
                        assert.propertyVal(result, 'body_fat', weight.body_fat)
                    })
            })
        })

        context('when the Weight is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                connectionRabbitmqPub.isConnected = true
                weight.id = '507f1f77bcf86cd799439011'

                return weightService.add(weight)
                    .catch(error => {
                        assert.propertyVal(error, 'message', 'Weight is already registered...')
                    })
            })
        })

        context('when the Weight is incorrect (missing all fields)', () => {
            it('should throw a ValidationException', async () => {
                try {
                    return await weightService.add(incorrectWeight1)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Measurement validation failed: type, timestamp, value, unit, ' +
                        'child_id is required!')
                }
            })
        })

        context('when the Weight is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', async () => {
                try {
                    return await weightService.add(incorrectWeight2)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the Weight is incorrect (type is invalid)', () => {
            it('should throw a ValidationException', async () => {
                try {
                    return await weightService.add(incorrectWeight3)
                } catch (err) {
                    assert.propertyVal(err, 'message',
                        'The type of measurement provided "invalidtype" is not supported...')
                    assert.propertyVal(err, 'description',
                        'The allowed types are: temperature, humidity, pm1, pm2.5, pm10, body_fat, weight.')
                }
            })
        })

        context('when the Weight is incorrect (body_fat of the Weight without all required fields)', () => {
            it('should throw a ValidationException', async () => {
                try {
                    return await weightService.add(incorrectWeight4)
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Required fields were not provided...')
                    assert.propertyVal(err, 'description', 'Measurement validation failed: type, timestamp, value, unit, ' +
                        'child_id is required!')
                }
            })
        })

        context('when the Weight is incorrect (body_fat of the Weight with an invalid child_id)', () => {
            it('should throw a ValidationException', async () => {
                try {
                    return await weightService.add(incorrectWeight5)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the Weight is incorrect (body_fat of the Weight with an invalid type)', () => {
            it('should throw a ValidationException', async () => {
                try {
                    return await weightService.add(incorrectWeight6)
                } catch (err) {
                    assert.propertyVal(err, 'message',
                        'The type of measurement provided "invalidtype" is not supported...')
                    assert.propertyVal(err, 'description',
                        'The allowed types are: temperature, humidity, pm1, pm2.5, pm10, body_fat, weight.')
                }
            })
        })
    })

    /**
     * Method "add(weight: Weight | Array<Weight>)" with Array<Weight> argument
     */
    describe('add(weight: Weight | Array<Weight>) with Array<Weight> argument', () => {
        context('when all the Weight objects of the array are correct, they still do not exist in the repository and there is ' +
            'a connection to the RabbitMQ', () => {
            it('should create each Weight and return a response of type MultiStatus<Weight> with the description ' +
                'of success in sending each one of them', () => {
                return weightService.add(correctWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctWeightArr[i].id)
                            assert.propertyVal(result.success[i].item, 'type', correctWeightArr[i].type)
                            assert.propertyVal(result.success[i].item, 'timestamp', correctWeightArr[i].timestamp)
                            assert.propertyVal(result.success[i].item, 'value', correctWeightArr[i].value)
                            assert.propertyVal(result.success[i].item, 'unit', correctWeightArr[i].unit)
                            assert.propertyVal(result.success[i].item, 'child_id', correctWeightArr[i].child_id)
                            assert.propertyVal(result.success[i].item, 'body_fat', correctWeightArr[i].body_fat)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the Weight objects of the array are correct, the body_fat of one of them already exists ' +
            'and will be associated with the Weight object', () => {
            it('should create each Weight and return a response of type MultiStatus<Weight> with the description ' +
                'of success in sending each one of them', () => {
                correctWeightArr[0].body_fat!.child_id = '507f1f77bcf86cd799439011'

                return weightService.add(correctWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctWeightArr[i].id)
                            assert.propertyVal(result.success[i].item, 'type', correctWeightArr[i].type)
                            assert.propertyVal(result.success[i].item, 'timestamp', correctWeightArr[i].timestamp)
                            assert.propertyVal(result.success[i].item, 'value', correctWeightArr[i].value)
                            assert.propertyVal(result.success[i].item, 'unit', correctWeightArr[i].unit)
                            assert.propertyVal(result.success[i].item, 'child_id', correctWeightArr[i].child_id)
                            assert.propertyVal(result.success[i].item, 'body_fat', correctWeightArr[i].body_fat)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the Weight objects of the array are correct, they still do not exist in the repository but there is no ' +
            'a connection to the RabbitMQ', () => {
            it('should save each Weight for submission attempt later to the bus and return a response of type ' +
                'MultiStatus<Weight> with the description of success in each one of them', () => {
                connectionRabbitmqPub.isConnected = false

                return weightService.add(correctWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctWeightArr[i].id)
                            assert.propertyVal(result.success[i].item, 'type', correctWeightArr[i].type)
                            assert.propertyVal(result.success[i].item, 'timestamp', correctWeightArr[i].timestamp)
                            assert.propertyVal(result.success[i].item, 'value', correctWeightArr[i].value)
                            assert.propertyVal(result.success[i].item, 'unit', correctWeightArr[i].unit)
                            assert.propertyVal(result.success[i].item, 'child_id', correctWeightArr[i].child_id)
                            assert.propertyVal(result.success[i].item, 'body_fat', correctWeightArr[i].body_fat)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the Weight objects of the array are correct, they still do not exist in the repository, there is no ' +
            'a connection to the RabbitMQ but the events could not be saved', () => {
            it('should return a response of type MultiStatus<Weight> with the description of success in each one of them ' +
                'because the current implementation does not throw an exception, it just prints a log', () => {
                correctWeightArr.forEach(elem => {
                    elem.id = '507f1f77bcf86cd799439012'            // Make mock throw an error in IntegrationEventRepository
                })

                return weightService.add(correctWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        for (let i = 0; i < result.success.length; i++) {
                            assert.propertyVal(result.success[i], 'code', HttpStatus.CREATED)
                            assert.propertyVal(result.success[i].item, 'id', correctWeightArr[i].id)
                            assert.propertyVal(result.success[i].item, 'type', correctWeightArr[i].type)
                            assert.propertyVal(result.success[i].item, 'timestamp', correctWeightArr[i].timestamp)
                            assert.propertyVal(result.success[i].item, 'value', correctWeightArr[i].value)
                            assert.propertyVal(result.success[i].item, 'unit', correctWeightArr[i].unit)
                            assert.propertyVal(result.success[i].item, 'child_id', correctWeightArr[i].child_id)
                            assert.propertyVal(result.success[i].item, 'body_fat', correctWeightArr[i].body_fat)
                        }

                        assert.isEmpty(result.error)
                    })
            })
        })

        context('when all the Weight objects of the array are correct but already exists in the repository', () => {
            it('should return a response of type MultiStatus<Weight> with the description of conflict in each one of ' +
                'them', () => {
                connectionRabbitmqPub.isConnected = true

                correctWeightArr.forEach(elem => {
                    elem.id = '507f1f77bcf86cd799439011'
                })

                return weightService.add(correctWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.CONFLICT)
                            assert.propertyVal(result.error[i], 'message', 'Weight is already registered...')
                            assert.propertyVal(result.error[i].item, 'id', correctWeightArr[i].id)
                            assert.propertyVal(result.error[i].item, 'type', correctWeightArr[i].type)
                            assert.propertyVal(result.error[i].item, 'timestamp', correctWeightArr[i].timestamp)
                            assert.propertyVal(result.error[i].item, 'value', correctWeightArr[i].value)
                            assert.propertyVal(result.error[i].item, 'unit', correctWeightArr[i].unit)
                            assert.propertyVal(result.error[i].item, 'child_id', correctWeightArr[i].child_id)
                            assert.propertyVal(result.error[i].item, 'body_fat', correctWeightArr[i].body_fat)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })

        context('when there are correct and incorrect Weight objects in the array and there is a connection to the RabbitMQ', () => {
            it('should create each correct Weight and return a response of type MultiStatus<Weight> with the description of success ' +
                'and error in each one of them', () => {
                return weightService.add(mixedWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        assert.propertyVal(result.success[0], 'code', HttpStatus.CREATED)
                        assert.propertyVal(result.success[0].item, 'id', mixedWeightArr[0].id)
                        assert.propertyVal(result.success[0].item, 'type', mixedWeightArr[0].type)
                        assert.propertyVal(result.success[0].item, 'timestamp', mixedWeightArr[0].timestamp)
                        assert.propertyVal(result.success[0].item, 'value', mixedWeightArr[0].value)
                        assert.propertyVal(result.success[0].item, 'unit', mixedWeightArr[0].unit)
                        assert.propertyVal(result.success[0].item, 'child_id', mixedWeightArr[0].child_id)
                        assert.propertyVal(result.success[0].item, 'body_fat', mixedWeightArr[0].body_fat)

                        assert.propertyVal(result.error[0], 'code', HttpStatus.BAD_REQUEST)
                        assert.propertyVal(result.error[0], 'message', 'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description', 'Measurement validation failed: type, ' +
                            'timestamp, value, unit, child_id is required!')
                    })
            })
        })

        context('when all the Weight objects of the array are incorrect', () => {
            it('should return a response of type MultiStatus<Weight> with the description of error in each one of them', () => {
                return weightService.add(incorrectWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        assert.propertyVal(result.error[0], 'message',
                            'Required fields were not provided...')
                        assert.propertyVal(result.error[0], 'description',
                            'Measurement validation failed: type, timestamp, value, unit, child_id is required!')
                        assert.propertyVal(result.error[1], 'message',
                            Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(result.error[1], 'description',
                            Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        assert.propertyVal(result.error[2], 'message',
                            'The type of measurement provided "invalidtype" is not supported...')
                        assert.propertyVal(result.error[2], 'description',
                            'The allowed types are: temperature, humidity, pm1, pm2.5, pm10, body_fat, weight.')
                        assert.propertyVal(result.error[3], 'message',
                            'Required fields were not provided...')
                        assert.propertyVal(result.error[3], 'description',
                            'Measurement validation failed: type, timestamp, value, unit, child_id is required!')
                        assert.propertyVal(result.error[4], 'message',
                            Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(result.error[4], 'description',
                            Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        assert.propertyVal(result.error[5], 'message',
                            'The type of measurement provided "invalidtype" is not supported...')
                        assert.propertyVal(result.error[5], 'description',
                            'The allowed types are: temperature, humidity, pm1, pm2.5, pm10, body_fat, weight.')

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.BAD_REQUEST)
                            assert.propertyVal(result.error[i].item, 'id', incorrectWeightArr[i].id)
                            assert.propertyVal(result.error[i].item, 'type', incorrectWeightArr[i].type)
                            assert.propertyVal(result.error[i].item, 'timestamp', incorrectWeightArr[i].timestamp)
                            assert.propertyVal(result.error[i].item, 'value', incorrectWeightArr[i].value)
                            assert.propertyVal(result.error[i].item, 'unit', incorrectWeightArr[i].unit)
                            assert.propertyVal(result.error[i].item, 'child_id', incorrectWeightArr[i].child_id)
                            assert.propertyVal(result.error[i].item, 'body_fat', incorrectWeightArr[i].body_fat)
                        }

                        assert.isEmpty(result.success)
                    })
            })
        })
    })

    /**
     * Method: getByIdAndChild(weightId: string, childId: string, query: IQuery)
     */
    describe('getByIdAndChild(weightId: string, childId: string, query: IQuery)', () => {
        context('when there is Weight with the received parameters', () => {
            it('should return the Weight that was found', () => {
                weight.id = '507f1f77bcf86cd799439011'            // Make mock return a Weight
                const query: IQuery = new Query()
                query.filters = {
                    _id: weight.id,
                    child_id: weight.child_id
                }

                return weightService.getByIdAndChild(weight.id, weight.child_id!, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no Weight with the received parameters', () => {
            it('should return undefined', () => {
                weight.id = '5a62be07de34500146d9c544'            // Make mock return undefined
                const query: IQuery = new Query()
                query.filters = {
                    _id: weight.id,
                    child_id: weight.child_id
                }

                return weightService.getByIdAndChild(weight.id, weight.child_id!, query)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the Weight id is invalid', () => {
            it('should throw a ValidationException', () => {
                weight.id = '5a62be07de34500146d9c5442'       // Make weight id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: weight.id,
                    child_id: weight.child_id
                }

                try {
                    return weightService.getByIdAndChild(weight.id, weight.child_id!, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the weight child_id is invalid', () => {
            it('should throw a ValidationException', () => {
                weight.id = '5a62be07de34500146d9c544'            // Make weight id valid again
                weight.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: weight.id,
                    child_id: weight.child_id
                }

                try {
                    return weightService.getByIdAndChild(weight.id, weight.child_id, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })
    })

    /**
     * Method: getAllByChild(childId: string, query: IQuery)
     */
    describe('getAllByChild(childId: string, query: IQuery)', () => {
        context('when there is at least one Weight associated with that childId', () => {
            it('should return a Weight array', () => {
                weight.child_id = '5a62be07de34500146d9c544'      // Make child_id valid again
                const query: IQuery = new Query()
                query.filters = {
                    child_id: weight.child_id,
                    type: MeasurementType.WEIGHT
                }

                return weightService.getAllByChild(weight.child_id, query)
                    .then(result => {
                        assert(result, 'result must not be undefined')
                    })
            })
        })

        context('when there is no Weight with the received parameters', () => {
            it('should return an empty array', () => {
                weight.child_id = '507f1f77bcf86cd799439011'        // Make mock return an empty array
                const query: IQuery = new Query()
                query.filters = {
                    child_id: weight.child_id,
                    type: MeasurementType.WEIGHT
                }

                return weightService.getAllByChild(weight.child_id, query)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when the Weight child_id is invalid', () => {
            it('should throw a ValidationException', () => {
                weight.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    child_id: weight.child_id,
                    type: MeasurementType.WEIGHT
                }

                try {
                    return weightService.getAllByChild(weight.child_id, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })
    })

    /**
     * Method: removeByChild(weightId: string, childId: string)
     */
    describe('removeByChild(weightId: string, childId: string)', () => {
        context('when there is Weight with the received parameters', () => {
            it('should return true', () => {
                weight.child_id = '5a62be07de34500146d9c544'     // Make child_id valid again
                weight.id = '507f1f77bcf86cd799439011'            // Make mock return true

                return weightService.removeByChild(weight.id, weight.child_id)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when there is no Weight with the received parameters', () => {
            it('should return false', () => {
                weight.id = '5a62be07de34500146d9c544'            // Make mock return false

                return weightService.removeByChild(weight.id, weight.child_id!)
                    .then(result => {
                        assert.equal(result, false)
                    })
            })
        })

        context('when there is Weight with the received parameters but there is no connection to the RabbitMQ', () => {
            it('should return true and save the event that will report the removal of the resource', () => {
                connectionRabbitmqPub.isConnected = false
                weight.id = '507f1f77bcf86cd799439011'            // Make mock return true

                return weightService.removeByChild(weight.id!, weight.child_id!)
                    .then(result => {
                        assert.equal(result, true)
                    })
            })
        })

        context('when the Weight is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                connectionRabbitmqPub.isConnected = true

                return weightService.removeByChild(incorrectWeight2.id!, incorrectWeight2.child_id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Weight is incorrect (id is invalid)', () => {
            it('should throw a ValidationException', () => {
                incorrectWeight2.id = '507f1f77bcf86cd7994390112'
                incorrectWeight2.child_id = '5a62be07de34500146d9c544'

                return weightService.removeByChild(incorrectWeight2.id!, incorrectWeight2.child_id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
