import HttpStatus from 'http-status-codes'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { MeasurementRepoModel } from '../../../src/infrastructure/database/schema/measurement.schema'
import { Strings } from '../../../src/utils/strings'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'
import { WeightEntityMapper } from '../../../src/infrastructure/entity/mapper/weight.entity.mapper'
import { BodyFatEntityMapper } from '../../../src/infrastructure/entity/mapper/body.fat.entity.mapper'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: children.weights', () => {

    const defaultWeight: Weight = new WeightMock()

    /**
     * Mock objects for POST route with multiple Weight objects
     */
        // Array with correct Weight objects
    const correctWeightArr: Array<Weight> = new Array<WeightMock>()
    for (let i = 0; i < 3; i++) {
        correctWeightArr.push(new WeightMock())
    }

    // Incorrect Weight objects
    const incorrectWeight: Weight = new Weight()         // Without all required fields
    incorrectWeight.type = ''

    // Array with correct and incorrect Weight objects
    const mixedWeightArr: Array<Weight> = new Array<WeightMock>()
    mixedWeightArr.push(new WeightMock())
    mixedWeightArr.push(incorrectWeight)

    // Start services
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                { interval: 100 })

            await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })

            await deleteAllWeights()
        } catch (err) {
            throw new Error('Failure on children.weights routes test: ' + err.message)
        }
    })

    // Delete all database Weight objects
    after(async () => {
        try {
            await deleteAllWeights()
            await dbConnection.dispose()
            await rabbitmq.dispose()
        } catch (err) {
            throw new Error('Failure on children.weights routes test: ' + err.message)
        }
    })
    /**
     * POST route with only one Weight in the body
     */
    describe('RABBITMQ PUBLISHER -> POST /v1/children/:child_id/weights with only one Weight in the body', () => {
        context('when posting a new Weight with success and publishing it to the bus', () => {
            const body = {
                timestamp: defaultWeight.timestamp,
                value: defaultWeight.value,
                unit: defaultWeight.unit,
                body_fat: defaultWeight.value
            }

            before(async () => {
                try {
                    await deleteAllWeights()

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on children.weights test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the weight ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subSaveWeight(message => {
                        try {
                            expect(message.event_name).to.eql('WeightSaveEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('weight')
                            expect(message.weight).to.have.property('id')
                            expect(message.weight.timestamp).to.eql(defaultWeight.timestamp!.toISOString())
                            expect(message.weight.value).to.eql(defaultWeight.value)
                            expect(message.weight.unit).to.eql(defaultWeight.unit)
                            expect(message.weight.child_id).to.eql(defaultWeight.child_id)
                            expect(message.weight.body_fat).to.eql(defaultWeight.value)
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .post(`/v1/children/${defaultWeight.child_id}/weights`)
                            .send(body)
                            .set('Content-Type', 'application/json')
                            .expect(201)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('POST /v1/children/:child_id/weights with only one Weight in the body', () => {
        context('when posting a new Weight with success (there is no connection to RabbitMQ)', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved Weight (and show an error log about unable to send ' +
                'SaveWeight event)', () => {
                const body = {
                    timestamp: defaultWeight.timestamp,
                    value: defaultWeight.value,
                    unit: defaultWeight.unit,
                    body_fat: defaultWeight.value
                }

                return request
                    .post(`/v1/children/${defaultWeight.child_id}/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.timestamp).to.eql(defaultWeight.timestamp!.toISOString())
                        expect(res.body.value).to.eql(defaultWeight.value)
                        expect(res.body.unit).to.eql(defaultWeight.unit)
                        expect(res.body.child_id).to.eql(defaultWeight.child_id)
                        expect(res.body.body_fat).to.eql(defaultWeight.value)
                    })
            })
        })

        context('when posting a new Weight (without body_fat) with success', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 201 and the saved Weight', () => {
                const body = {
                    timestamp: defaultWeight.timestamp,
                    value: defaultWeight.value,
                    unit: defaultWeight.unit
                }

                return request
                    .post(`/v1/children/${defaultWeight.child_id}/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.timestamp).to.eql(defaultWeight.timestamp!.toISOString())
                        expect(res.body.value).to.eql(defaultWeight.value)
                        expect(res.body.unit).to.eql(defaultWeight.unit)
                        expect(res.body.child_id).to.eql(defaultWeight.child_id)
                        expect(res.body.body_fat).to.eql(undefined)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await deleteAllWeights()

                    const result = await createBodyFat({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.body_fat!.value,
                        unit: defaultWeight.body_fat!.unit,
                        child_id: defaultWeight.child_id
                    })

                    await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: defaultWeight.child_id,
                        body_fat: result
                    })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })
            it('should return status code 409 and an info message about duplicate items', () => {
                const body = {
                    timestamp: defaultWeight.timestamp,
                    value: defaultWeight.value,
                    unit: defaultWeight.unit,
                    body_fat: defaultWeight.body_fat!.value
                }

                return request
                    .post(`/v1/children/${defaultWeight.child_id}/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.code).to.eql(409)
                        expect(err.body.message).to.eql(Strings.WEIGHT.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs (missing required fields)', () => {
            it('should return status code 400 and info message about the missing fields', () => {
                const body = {}

                return request
                    .post(`/v1/children/${defaultWeight.child_id}/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Measurement validation failed: timestamp, value, unit is required!')
                    })
            })
        })

        context('when a validation error occurs (child_id is invalid)', () => {
            it('should return status code 400 and info message about the missing fields', () => {
                const body = {
                    timestamp: defaultWeight.timestamp,
                    value: defaultWeight.value,
                    unit: defaultWeight.unit,
                    body_fat: defaultWeight.body_fat!.value
                }

                return request
                    .post(`/v1/children/123/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * POST route with a Weight array in the body
     */
    describe('POST /v1/children/:child_id/weights with a Weight array in the body', () => {
        context('when all the Weight objects are correct and still do not exist in the repository', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 207, create each Weight and return a response of type MultiStatus<Weight> ' +
                'with the description of success in sending each one of them', () => {
                const body: any = []

                correctWeightArr.forEach(weight => {
                    const bodyElem = {
                        timestamp: weight.timestamp,
                        value: weight.value,
                        unit: weight.unit,
                        body_fat: weight.body_fat!.value
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultWeight.child_id}/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item).to.have.property('id')
                            expect(res.body.success[i].item.timestamp).to.eql(correctWeightArr[i].timestamp!.toISOString())
                            expect(res.body.success[i].item.value).to.eql(correctWeightArr[i].value)
                            expect(res.body.success[i].item.unit).to.eql(correctWeightArr[i].unit)
                            expect(res.body.success[i].item.child_id).to.eql(correctWeightArr[i].child_id)
                            expect(res.body.success[i].item.body_fat).to.eql(correctWeightArr[i].body_fat!.value)
                        }

                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the Weight objects are correct but already exists in the repository', () => {
            before(async () => {
                try {
                    await deleteAllWeights()

                    for (const weight of correctWeightArr) {
                        const result = await createBodyFat({
                            timestamp: weight.timestamp,
                            value: weight.body_fat!.value,
                            unit: weight.body_fat!.unit,
                            child_id: weight.child_id
                        })

                        await createWeight({
                            timestamp: weight.timestamp,
                            value: weight.value,
                            unit: weight.unit,
                            child_id: weight.child_id,
                            body_fat: result
                        })
                    }
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })
            it('should return status code 201 and return a response of type MultiStatus<Weight> with the ' +
                'description of conflict in sending each one of them', () => {
                const body: any = []

                correctWeightArr.forEach(bodyFat => {
                    const bodyElem = {
                        timestamp: bodyFat.timestamp,
                        value: bodyFat.value,
                        unit: bodyFat.unit,
                        body_fat: bodyFat.body_fat!.value
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultWeight.child_id}/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.CONFLICT)
                            expect(res.body.error[i].message).to.eql(Strings.WEIGHT.ALREADY_REGISTERED)
                            expect(res.body.error[i].item.timestamp).to.eql(correctWeightArr[i].timestamp!.toISOString())
                            expect(res.body.error[i].item.value).to.eql(correctWeightArr[i].value)
                            expect(res.body.error[i].item.unit).to.eql(correctWeightArr[i].unit)
                            expect(res.body.error[i].item.child_id).to.eql(correctWeightArr[i].child_id)
                            expect(res.body.error[i].item.body_fat).to.eql(correctWeightArr[i].body_fat!.value)
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })

        context('when there are correct and incorrect Weight objects in the body', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<Weight> with the ' +
                'description of success and error in each one of them', () => {
                const body: any = []

                mixedWeightArr.forEach(bodyFat => {
                    const bodyElem = {
                        timestamp: bodyFat.timestamp,
                        value: bodyFat.value,
                        unit: bodyFat.unit,
                        body_fat: (bodyFat.body_fat) ? bodyFat.body_fat.value : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultWeight.child_id}/weights`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        // Success item
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item).to.have.property('id')
                        expect(res.body.success[0].item.timestamp).to.eql(mixedWeightArr[0].timestamp!.toISOString())
                        expect(res.body.success[0].item.value).to.eql(mixedWeightArr[0].value)
                        expect(res.body.success[0].item.unit).to.eql(mixedWeightArr[0].unit)
                        expect(res.body.success[0].item.child_id).to.eql(mixedWeightArr[0].child_id)
                        expect(res.body.success[0].item.body_fat).to.eql(mixedWeightArr[0].body_fat!.value)

                        // Error item
                        expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[0].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[0].description).to.eql('Measurement validation failed: timestamp, value, unit is required!')
                    })
            })
        })
    })
    /**
     * Route GET all Weight
     */
    describe('GET /v1/children/:child_id/weights', () => {
        context('when get all Weight of a child successfully', () => {
            before(async () => {
                let result
                try {
                    result = await createBodyFat({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.body_fat!.value,
                        unit: defaultWeight.body_fat!.unit,
                        child_id: defaultWeight.child_id
                    })

                    await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: defaultWeight.child_id,
                        body_fat: result
                    })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })
            it('should return status code 200 and a list of all Weight objects found', () => {
                return request
                    .get(`/v1/children/${defaultWeight.child_id}/weights`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of the successful POST route test or using the create method above).
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].timestamp).to.eql(defaultWeight.timestamp!.toISOString())
                        expect(res.body[0].value).to.eql(defaultWeight.value)
                        expect(res.body[0].unit).to.eql(defaultWeight.unit)
                        expect(res.body[0].child_id).to.eql(defaultWeight.child_id)
                        expect(res.body[0].body_fat).to.eql(defaultWeight.body_fat!.value)
                    })
            })
        })

        context('when there are no Weight associated with the child in the database', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', () => {
                return request
                    .get(`/v1/children/${defaultWeight.child_id}/weights`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', () => {
                return request
                    .get(`/v1/children/123/weights`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get Weight of a child using the "query-strings-parser" library', () => {
            before(async () => {
                try {
                    await deleteAllWeights()

                    const result = await createBodyFat({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.body_fat!.value,
                        unit: defaultWeight.body_fat!.unit,
                        child_id: defaultWeight.child_id
                    })

                    await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: defaultWeight.child_id,
                        body_fat: result
                    })

                    await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: new ObjectID(),
                        body_fat: result
                    })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the result as needed in the query', () => {
                const url = `/v1/children/${defaultWeight.child_id}/weights?child_id=${defaultWeight.child_id}`
                    .concat(`&sort=child_id&page=1&limit=3`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of the successful POST route test or using the create method above).
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].timestamp).to.eql(defaultWeight.timestamp!.toISOString())
                        expect(res.body[0].value).to.eql(defaultWeight.value)
                        expect(res.body[0].unit).to.eql(defaultWeight.unit)
                        expect(res.body[0].child_id).to.eql(defaultWeight.child_id)
                        expect(res.body[0].body_fat).to.eql(defaultWeight.body_fat!.value)
                    })
            })
        })

        context('when there is an attempt to get Weight of a child using the "query-strings-parser" library but there is no Weight ' +
            'in the database', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', () => {
                const url = `/v1/children/${defaultWeight.child_id}/weights?child_id=${defaultWeight.child_id}`
                    .concat(`&sort=child_id&page=1&limit=3`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when there is an attempt to get Weight of a child using the "query-strings-parser" library ' +
            'but the child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', () => {
                const url = `/v1/children/123/weights?child_id=${defaultWeight.child_id}&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * Route GET a Weight by child
     */
    describe('GET /v1/children/:child_id/weights/:weight_id', () => {
        context('when get a specific Weight of a child of the database successfully', () => {
            let result
            before(async () => {
                try {
                    await deleteAllWeights()

                    const bodyFat = await createBodyFat({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.body_fat!.value,
                        unit: defaultWeight.body_fat!.unit,
                        child_id: defaultWeight.child_id
                    })

                    result = await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: defaultWeight.child_id,
                        body_fat: bodyFat
                    })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 200 and that specific Weight of that child', () => {
                return request
                    .get(`/v1/children/${result.child_id}/weights/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of the successful POST route test or using the create method above).
                        expect(res.body).to.have.property('id')
                        expect(res.body.timestamp).to.eql(defaultWeight.timestamp!.toISOString())
                        expect(res.body.value).to.eql(defaultWeight.value)
                        expect(res.body.unit).to.eql(defaultWeight.unit)
                        expect(res.body.child_id).to.eql(defaultWeight.child_id!.toString())
                        expect(res.body.body_fat).to.eql(defaultWeight.body_fat!.value)
                    })
            })
        })

        context('when there is no that specific Weight associated with that child in the database', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message describing that Weight was not found', () => {
                return request
                    .get(`/v1/children/${defaultWeight.child_id}/weights/${defaultWeight.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('Weight not found!')
                        expect(err.body.description).to.eql('Weight not found or already removed. A new operation for ' +
                            'the same resource is not required!')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', () => {
                return request
                    .get(`/v1/children/123/weights/${defaultWeight.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Weight id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid Weight id', () => {
                return request
                    .get(`/v1/children/${defaultWeight.child_id}/weights/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get a specific Weight of a child using the "query-strings-parser" library', () => {
            let result
            before(async () => {
                try {
                    await deleteAllWeights()

                    const bodyFat = await createBodyFat({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.body_fat!.value,
                        unit: defaultWeight.body_fat!.unit,
                        child_id: defaultWeight.child_id
                    })

                    result = await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: defaultWeight.child_id,
                        body_fat: bodyFat
                    })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the result as needed in the query', () => {
                const url = `/v1/children/${result.child_id}/weights/${result.id}?child_id=${result.child_id}`
                    .concat(`&sort=child_id&page=1&limit=3`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.timestamp).to.eql(defaultWeight.timestamp!.toISOString())
                        expect(res.body.value).to.eql(defaultWeight.value)
                        expect(res.body.unit).to.eql(defaultWeight.unit)
                        expect(res.body.child_id).to.eql(defaultWeight.child_id!.toString())
                        expect(res.body.body_fat).to.eql(defaultWeight.body_fat!.value)
                    })
            })
        })

        context('when there is an attempt to get a specific Weight using the "query-strings-parser" library but this Weight ' +
            'does not exist', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message describing that Weight was not found', () => {
                const url = `/v1/children/${defaultWeight.child_id}/weights/${defaultWeight.id}?child_id=${defaultWeight.child_id}`
                    .concat(`&sort=child_id&page=1&limit=3`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('Weight not found!')
                        expect(err.body.description).to.eql('Weight not found or already removed. A new operation for ' +
                            'the same resource is not required!')
                    })
            })
        })

        context('when there is an attempt to get a specific Weight using the "query-strings-parser" library but the ' +
            'child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', () => {
                const url = `/v1/children/123/weights/${defaultWeight.id}?child_id=${defaultWeight.child_id}
                    &sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when there is an attempt to get a specific Weight using the "query-strings-parser" library but the ' +
            'Weight id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid Weight id', () => {
                const url = `/v1/children/${defaultWeight.child_id}/weights/123?child_id=${defaultWeight.child_id}`
                    .concat(`&sort=child_id&page=1&limit=3`)

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * DELETE route
     */
    describe('RABBITMQ PUBLISHER -> DELETE /v1/children/:child_id/weights/:weight_id', () => {
        context('when the Weight was deleted successfully and your ID is published on the bus', () => {
            let result

            before(async () => {
                try {
                    await deleteAllWeights()

                    const bodyFat = await createBodyFat({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.body_fat!.value,
                        unit: defaultWeight.body_fat!.unit,
                        child_id: defaultWeight.child_id
                    })

                    result = await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: defaultWeight.child_id,
                        body_fat: bodyFat
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on children.weights test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and that has the same ID ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subDeleteWeight(message => {
                        try {
                            expect(message.event_name).to.eql('WeightDeleteEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('weight')
                            expect(message.weight).to.have.property('id')
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .delete(`/v1/children/${result.child_id}/weights/${result.id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('DELETE /v1/children/:child_id/weights/:weight_id', () => {
        context('when the Weight was deleted successfully (there is no connection to RabbitMQ)', () => {
            let result

            before(async () => {
                try {
                    await deleteAllWeights()

                    const bodyFat = await createBodyFat({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.body_fat!.value,
                        unit: defaultWeight.body_fat!.unit,
                        child_id: defaultWeight.child_id
                    })

                    result = await createWeight({
                        timestamp: defaultWeight.timestamp,
                        value: defaultWeight.value,
                        unit: defaultWeight.unit,
                        child_id: defaultWeight.child_id,
                        body_fat: bodyFat
                    })
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for Weight (and show an error log about unable to send ' +
                'DeleteWeight event)', () => {
                return request
                    .delete(`/v1/children/${result.child_id}/weights/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the Weight is not found', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for Weight', () => {
                return request
                    .delete(`/v1/children/${defaultWeight.child_id}/weights/${defaultWeight.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', () => {
                return request
                    .delete(`/v1/children/123/weights/${defaultWeight.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the Weight id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on children.weights routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid Weight id', () => {
                return request
                    .delete(`/v1/children/${defaultWeight.child_id}/weights/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.WEIGHT.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})

async function createBodyFat(item): Promise<any> {
    const bodyFatMapper: BodyFatEntityMapper = new BodyFatEntityMapper()
    const resultModel = bodyFatMapper.transform(item)
    const resultModelEntity = bodyFatMapper.transform(resultModel)
    return await Promise.resolve(MeasurementRepoModel.create(resultModelEntity))
}

async function createWeight(item): Promise<any> {
    const weightMapper: WeightEntityMapper = new WeightEntityMapper()
    const resultModel = weightMapper.transform(item)
    const resultModelEntity = weightMapper.transform(resultModel)
    return await Promise.resolve(MeasurementRepoModel.create(resultModelEntity))
}

async function deleteAllWeights() {
    return MeasurementRepoModel.deleteMany({})
}
