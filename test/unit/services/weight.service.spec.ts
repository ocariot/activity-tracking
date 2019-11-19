import HttpStatus from 'http-status-codes'
import { assert } from 'chai'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { RabbitMQMock } from '../../mocks/rabbitmq.mock'
import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
import { ConnectionFactoryRabbitMQMock } from '../../mocks/connection.factory.rabbitmq.mock'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { Strings } from '../../../src/utils/strings'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { MultiStatus } from '../../../src/application/domain/model/multi.status'
import { IWeightRepository } from '../../../src/application/port/weight.repository.interface'
import { WeightRepositoryMock } from '../../mocks/weight.repository.mock'
import { IWeightService } from '../../../src/application/port/weight.service.interface'
import { WeightService } from '../../../src/application/service/weight.service'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'
import { BodyFat } from '../../../src/application/domain/model/body.fat'
import { IBodyFatRepository } from '../../../src/application/port/body.fat.repository.interface'
import { BodyFatRepositoryMock } from '../../mocks/body.fat.repository.mock'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { Default } from '../../../src/utils/default'

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
    incorrectWeight1.type = undefined

    const incorrectWeight2: Weight = new WeightMock()    // child_id is invalid
    incorrectWeight2.child_id = '5a62be07de34500146d9c5442'

    const incorrectWeight3: Weight = new WeightMock()    // body_fat of the Weight without all required fields
    const incorrectBodyFatJSON: any = {
        type: MeasurementType.BODY_FAT,
        timestamp: new Date(1560826800000 + Math.floor((Math.random() * 1000))),
        value: -20,
        unit: '%',
        child_id: '5a62be07de34500146d9c544'
    }
    incorrectWeight3.body_fat = new BodyFat().fromJSON(incorrectBodyFatJSON)

    const incorrectWeight4: Weight = new WeightMock()    // body_fat of the Weight with an invalid child_id
    incorrectBodyFatJSON.value = 'invalidValue'
    incorrectWeight4.body_fat = new BodyFat().fromJSON(incorrectBodyFatJSON)

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

    const weightRepo: IWeightRepository = new WeightRepositoryMock()
    const bodyFatRepo: IBodyFatRepository = new BodyFatRepositoryMock()

    const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitMQMock()
    const rabbitmq: IEventBus = new RabbitMQMock(connectionFactoryRabbitmq)
    const customLogger: ILogger = new CustomLoggerMock()

    const weightService: IWeightService = new WeightService(weightRepo, bodyFatRepo, rabbitmq, customLogger)

    before(async () => {
        try {
            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI, { sslOptions: { ca: [] } })
        } catch (err) {
            throw new Error('Failure on WeightService unit test: ' + err.message)
        }
    })

    /**
     * Method: add(weight: Weight | Array<Weight>) with Weight argument)
     */
    describe('add(weight: Weight | Array<Weight>) with Weight argument)', () => {
        context('when the Weight is correct and it still does not exist in the repository', () => {
            it('should return the Weight that was added', () => {
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

        context('when the Weight is correct, your body_fat already exists and will be associated with the Weight object)', () => {
            it('should return the Weight that was added', () => {
                weight.body_fat!.child_id = '507f1f77bcf86cd799439011'

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

        context('when the Weight is correct, your body_fat does not exist and will be created)', () => {
            it('should return the Weight that was added', () => {
                weight.body_fat!.child_id = '507f1f77bcf86cd799439012'

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

        context('when the Weight is correct, your body_fat does not exist but is not successfully created in the database)', () => {
            it('should return the Weight that was added', () => {
                weight.body_fat!.id = '507f1f77bcf86cd799439013'            // Make return undefined in create method

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

        context('when the Weight is correct and does not have the body_fat attribute)', () => {
            it('should return the Weight that was added', () => {
                weight.body_fat = undefined

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

        context('when the Weight is correct but is not successfully created in the database', () => {
            it('should return undefined', () => {
                weight.id = '507f1f77bcf86cd799439013'          // Make return undefined in create method

                return weightService.add(weight)
                    .then((result) => {
                        assert.equal(result, undefined)
                    })
            })
        })

        context('when the Weight is correct but already exists in the repository', () => {
            it('should throw a ConflictException', () => {
                weight.id = '507f1f77bcf86cd799439011'          // Make mock return true in checkExist method

                return weightService.add(weight)
                    .catch(error => {
                        assert.propertyVal(error, 'message', Strings.WEIGHT.ALREADY_REGISTERED)
                    })
            })
        })

        context('when the Weight is incorrect (missing all fields)', () => {
            it('should throw a ValidationException', () => {
                return weightService.add(incorrectWeight1)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        assert.propertyVal(err, 'description', 'type, timestamp, value, unit, child_id'
                            .concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                    })
            })
        })

        context('when the Weight is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                return weightService.add(incorrectWeight2)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Weight is incorrect (body_fat of the Weight without all required fields)', () => {
            it('should throw a ValidationException', () => {
                return weightService.add(incorrectWeight3)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', 'body_fat'.concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                    })
            })
        })

        context('when the Weight is incorrect (body_fat of the Weight with an invalid child_id)', () => {
            it('should throw a ValidationException', () => {
                return weightService.add(incorrectWeight4)
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(err, 'description', 'body_fat'.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
                    })
            })
        })
    })

    /**
     * Method "add(weight: Weight | Array<Weight>)" with Array<Weight> argument
     */
    describe('add(weight: Weight | Array<Weight>) with Array<Weight> argument', () => {
        context('when all the Weight objects of the array are correct and they still do not exist in the repository', () => {
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

        context('when all the Weight objects of the array are correct but already exists in the repository', () => {
            it('should return a response of type MultiStatus<Weight> with the description of conflict in each one of ' +
                'them', () => {
                correctWeightArr.forEach(elem => {
                    elem.id = '507f1f77bcf86cd799439011'
                })

                return weightService.add(correctWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        for (let i = 0; i < result.error.length; i++) {
                            assert.propertyVal(result.error[i], 'code', HttpStatus.CONFLICT)
                            assert.propertyVal(result.error[i], 'message', Strings.WEIGHT.ALREADY_REGISTERED)
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

        context('when there are correct and incorrect Weight objects in the array', () => {
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
                        assert.propertyVal(result.error[0], 'message', Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        assert.propertyVal(result.error[0], 'description', 'type, timestamp, value, unit, ' +
                            'child_id'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                    })
            })
        })

        context('when all the Weight objects of the array are incorrect', () => {
            it('should return a response of type MultiStatus<Weight> with the description of error in each one of them', () => {
                return weightService.add(incorrectWeightArr)
                    .then((result: Weight | MultiStatus<Weight>) => {
                        result = result as MultiStatus<Weight>

                        assert.propertyVal(result.error[0], 'message',
                            Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        assert.propertyVal(result.error[0], 'description',
                            'type, timestamp, value, unit, child_id'.concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
                        assert.propertyVal(result.error[1], 'message',
                            Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(result.error[1], 'description',
                            Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        assert.propertyVal(result.error[2], 'message',
                            Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(result.error[2], 'description', 'body_fat'
                            .concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
                        assert.propertyVal(result.error[3], 'message',
                            Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        assert.propertyVal(result.error[3], 'description', 'body_fat'
                            .concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))

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
            it('should throw a ValidationException', async () => {
                weight.id = '5a62be07de34500146d9c5442'       // Make weight id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: weight.id,
                    child_id: weight.child_id
                }

                try {
                    await weightService.getByIdAndChild(weight.id, weight.child_id!, query)
                } catch (err) {
                    assert.propertyVal(err, 'message', Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
                    assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('when the weight child_id is invalid', () => {
            it('should throw a ValidationException', async () => {
                weight.id = '5a62be07de34500146d9c544'            // Make weight id valid again
                weight.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    _id: weight.id,
                    child_id: weight.child_id
                }

                try {
                    await weightService.getByIdAndChild(weight.id, weight.child_id, query)
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
            it('should throw a ValidationException', async () => {
                weight.child_id = '5a62be07de34500146d9c5442'     // Make child_id invalid
                const query: IQuery = new Query()
                query.filters = {
                    child_id: weight.child_id,
                    type: MeasurementType.WEIGHT
                }

                try {
                    await weightService.getAllByChild(weight.child_id, query)
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

        context('when the Weight is incorrect (child_id is invalid)', () => {
            it('should throw a ValidationException', () => {
                return weightService.removeByChild(incorrectWeight2.id!, incorrectWeight2.child_id!)
                    .catch(err => {
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
                    .catch(err => {
                        assert.propertyVal(err, 'message', Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
                        assert.propertyVal(err, 'description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })

    describe('countWeights(childId: string)', () => {
        context('when there is at least one weight associated with the child received', () => {
            it('should return how many weights are associated with such child in the database', () => {
                return weightService.countByChild(weight.child_id!)
                    .then(res => {
                        assert.equal(res, 1)
                    })
            })
        })
    })
})
