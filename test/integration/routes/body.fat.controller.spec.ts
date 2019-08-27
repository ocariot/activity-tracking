import HttpStatus from 'http-status-codes'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { BackgroundService } from '../../../src/background/background.service'
import { expect } from 'chai'
import { ObjectID } from 'bson'
import { BodyFat } from '../../../src/application/domain/model/body.fat'
import { BodyFatMock } from '../../mocks/body.fat.mock'
import { BodyFatEntityMapper } from '../../../src/infrastructure/entity/mapper/body.fat.entity.mapper'
import { MeasurementRepoModel } from '../../../src/infrastructure/database/schema/measurement.schema'
import { Strings } from '../../../src/utils/strings'

const backgroundServices: BackgroundService = DIContainer.get(Identifier.BACKGROUND_SERVICE)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: children.bodyfats', () => {

    const defaultBodyFat: BodyFat = new BodyFatMock()

    /**
     * Mock objects for POST route with multiple BodyFat objects
     */
    // Array with correct BodyFat objects
    const correctBodyFatArr: Array<BodyFat> = new Array<BodyFatMock>()
    for (let i = 0; i < 3; i++) {
        correctBodyFatArr.push(new BodyFatMock())
    }

    // Incorrect BodyFat object
    const incorrectBodyFat: BodyFat = new BodyFat()           // Without all required fields
    incorrectBodyFat.unit = undefined

    // Array with correct and incorrect BodyFat objects
    const mixedBodyFatArr: Array<BodyFat> = new Array<BodyFatMock>()
    mixedBodyFatArr.push(new BodyFatMock())
    mixedBodyFatArr.push(incorrectBodyFat)

    // Start services
    before(async () => {
        try {
            deleteAllBodyFat()
            await backgroundServices.startServices()
        } catch (err) {
            throw new Error('Failure on children.bodyfats routes test: ' + err.message)
        }
    })

    // Delete all database BodyFat objects
    after(async () => {
        try {
            deleteAllBodyFat()
        } catch (err) {
            throw new Error('Failure on children.bodyfats routes test: ' + err.message)
        }
    })
    /**
     * POST route with only one BodyFat in the body
     */
    describe('POST /v1/children/:child_id/bodyfats with only one BodyFat in the body', () => {
        context('when posting a new BodyFat with success', () => {
            it('should return status code 201 and the saved BodyFat', () => {
                const body = {
                    timestamp: defaultBodyFat.timestamp,
                    value: defaultBodyFat.value,
                    unit: defaultBodyFat.unit
                }

                return request
                    .post(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        defaultBodyFat.id = res.body.id
                        expect(res.body.id).to.eql(defaultBodyFat.id)
                        expect(res.body.timestamp).to.eql(defaultBodyFat.timestamp!.toISOString())
                        expect(res.body.value).to.eql(defaultBodyFat.value)
                        expect(res.body.unit).to.eql(defaultBodyFat.unit)
                        expect(res.body.child_id).to.eql(defaultBodyFat.child_id)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and an info message about duplicate items', () => {
                const body = {
                    timestamp: defaultBodyFat.timestamp,
                    value: defaultBodyFat.value,
                    unit: defaultBodyFat.unit
                }

                return request
                    .post(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.code).to.eql(409)
                        expect(err.body.message).to.eql('BodyFat is already registered...')
                    })
            })
        })

        context('when a validation error occurs (missing required fields)', () => {
            it('should return status code 400 and info message about the missing fields', () => {
                const body = {}

                return request
                    .post(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body.description).to.eql('Measurement validation failed: timestamp, value is required!')
                    })
            })
        })

        context('when a validation error occurs (child_id is invalid)', () => {
            it('should return status code 400 and info message about the missing fields', () => {
                const body = {
                    timestamp: defaultBodyFat.timestamp,
                    value: defaultBodyFat.value,
                    unit: defaultBodyFat.unit
                }

                return request
                    .post(`/v1/children/123/bodyfats`)
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
     * POST route with a BodyFat array in the body
     */
    describe('POST /v1/children/:child_id/bodyfats with a BodyFat array in the body', () => {
        context('when all the BodyFat objects are correct and still do not exist in the repository', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 201, create each BodyFat and return a response of type MultiStatus<BodyFat> ' +
                'with the description of success in sending each one of them', () => {
                const body: any = []

                correctBodyFatArr.forEach(bodyFat => {
                    const bodyElem = {
                        timestamp: bodyFat.timestamp,
                        value: bodyFat.value,
                        unit: bodyFat.unit
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.timestamp).to.eql(correctBodyFatArr[i].timestamp!.toISOString())
                            expect(res.body.success[i].item.value).to.eql(correctBodyFatArr[i].value)
                            expect(res.body.success[i].item.unit).to.eql(correctBodyFatArr[i].unit)
                            expect(res.body.success[i].item.child_id).to.eql(correctBodyFatArr[i].child_id)
                        }

                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the BodyFat objects are correct but already exists in the repository', () => {
            it('should return status code 201 and return a response of type MultiStatus<BodyFat> with the ' +
                'description of conflict in sending each one of them', () => {
                const body: any = []

                correctBodyFatArr.forEach(bodyFat => {
                    const bodyElem = {
                        timestamp: bodyFat.timestamp,
                        value: bodyFat.value,
                        unit: bodyFat.unit
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.CONFLICT)
                            expect(res.body.error[i].message).to.eql('BodyFat is already registered...')
                            expect(res.body.error[i].item.timestamp).to.eql(correctBodyFatArr[i].timestamp!.toISOString())
                            expect(res.body.error[i].item.value).to.eql(correctBodyFatArr[i].value)
                            expect(res.body.error[i].item.unit).to.eql(correctBodyFatArr[i].unit)
                            expect(res.body.error[i].item.child_id).to.eql(correctBodyFatArr[i].child_id)
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })

        context('when there are correct and incorrect BodyFat objects in the body', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<BodyFat> with the ' +
                'description of success and error in each one of them', () => {
                const body: any = []

                mixedBodyFatArr.forEach(bodyFat => {
                    const bodyElem = {
                        timestamp: bodyFat.timestamp,
                        value: bodyFat.value,
                        unit: bodyFat.unit
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        // Success item
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.timestamp).to.eql(mixedBodyFatArr[0].timestamp!.toISOString())
                        expect(res.body.success[0].item.value).to.eql(mixedBodyFatArr[0].value)
                        expect(res.body.success[0].item.unit).to.eql(mixedBodyFatArr[0].unit)
                        expect(res.body.success[0].item.child_id).to.eql(mixedBodyFatArr[0].child_id)

                        // Error item
                        expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[0].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[0].description).to.eql('Measurement validation failed: timestamp, value is required!')
                    })
            })
        })
    })
    /**
     * Route GET all BodyFat
     */
    describe('GET /v1/children/:child_id/bodyfats', () => {
        context('when get all BodyFat of a child successfully', () => {
            it('should return status code 200 and a list of all BodyFat objects found', async () => {
                try{
                    await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .get(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultBodyFat.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of a successful POST route test or using the create method above).
                        expect(res.body[0].id).to.eql(defaultBodyFat.id)
                        expect(res.body[0].timestamp).to.eql(defaultBodyFat.timestamp!.toISOString())
                        expect(res.body[0].value).to.eql(defaultBodyFat.value)
                        expect(res.body[0].unit).to.eql(defaultBodyFat.unit)
                        expect(res.body[0].child_id).to.eql(defaultBodyFat.child_id)
                    })
            })
        })

        context('when there are no BodyFat associated with the child in the database', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                return request
                    .get(`/v1/children/${defaultBodyFat.child_id}/bodyfats`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .get(`/v1/children/123/bodyfats`)
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
        context('when get BodyFat of a child using the "query-strings-parser" library', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the result as needed in the query', async () => {
                try {
                    await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })

                    await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: new ObjectID()
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                const url = `/v1/children/${defaultBodyFat.child_id}/bodyfats?child_id=${defaultBodyFat.child_id}
                    &sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultBodyFat.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of a successful POST route test or using the create method above).
                        expect(res.body[0].id).to.eql(defaultBodyFat.id)
                        expect(res.body[0].timestamp).to.eql(defaultBodyFat.timestamp!.toISOString())
                        expect(res.body[0].value).to.eql(defaultBodyFat.value)
                        expect(res.body[0].unit).to.eql(defaultBodyFat.unit)
                        expect(res.body[0].child_id).to.eql(defaultBodyFat.child_id)
                    })
            })
        })

        context('when there is an attempt to get BodyFat of a child using the "query-strings-parser" library but there is no BodyFat ' +
            'associated with the child in the database', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                const url = `/v1/children/${defaultBodyFat.child_id}/bodyfats?child_id=${defaultBodyFat.child_id}
                    &sort=child_id&page=1&limit=3`

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

        context('when there is an attempt to get BodyFat of a child using the "query-strings-parser" library ' +
            'but the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                const url = `/v1/children/123/bodyfats?child_id=${defaultBodyFat.child_id}&sort=child_id&page=1&limit=3`

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
     * Route GET a BodyFat by child
     */
    describe('GET /v1/children/:child_id/bodyfats/:bodyfat_id', () => {
        context('when get a specific BodyFat of a child of the database successfully', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 200 and that specific BodyFat of that child', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .get(`/v1/children/${result.child_id}/bodyfats/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object (created
                        // in the case of a successful POST route test or using the create method above).
                        expect(res.body.id).to.eql(result.id)
                        expect(res.body.timestamp).to.eql(result.timestamp!.toISOString())
                        expect(res.body.value).to.eql(result.value)
                        expect(res.body.unit).to.eql(result.unit)
                        expect(res.body.child_id).to.eql(result.child_id.toString())
                    })
            })
        })

        context('when there is no that specific BodyFat associated with that child in the database', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message describing that BodyFat was not found', async () => {
                return request
                    .get(`/v1/children/${defaultBodyFat.child_id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('BodyFat not found!')
                        expect(err.body.description).to.eql('BodyFat not found or already removed. A new operation for ' +
                            'the same resource is not required!')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .get(`/v1/children/123/bodyfats/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the BodyFat id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid BodyFat id', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .get(`/v1/children/${result.child_id}/bodyfats/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.BODY_FAT.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get a specific BodyFat of a child using the "query-strings-parser" library', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the result as needed in the query', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                const url = `/v1/children/${result.child_id}/bodyfats/${result.id}?child_id=${result.child_id}
                    &sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(result.id)
                        expect(res.body.timestamp).to.eql(result.timestamp!.toISOString())
                        expect(res.body.value).to.eql(result.value)
                        expect(res.body.unit).to.eql(result.unit)
                        expect(res.body.child_id).to.eql(result.child_id.toString())
                    })
            })
        })

        context('when there is an attempt to get a specific BodyFat using the "query-strings-parser" library but this BodyFat ' +
            'does not exist', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message describing that BodyFat was not found', async () => {
                const url = `/v1/children/${defaultBodyFat.child_id}/bodyfats/${defaultBodyFat.id}?child_id=${defaultBodyFat.child_id}
                    &sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('BodyFat not found!')
                        expect(err.body.description).to.eql('BodyFat not found or already removed. A new operation for ' +
                            'the same resource is not required!')
                    })
            })
        })

        context('when there is an attempt to get a specific BodyFat using the "query-strings-parser" library but the ' +
            'child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                const url = `/v1/children/123/bodyfats/${result.id}?child_id=${result.child_id}
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

        context('when there is an attempt to get a specific BodyFat using the "query-strings-parser" library but the ' +
            'BodyFat id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid BodyFat id', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                const url = `/v1/children/${result.child_id}/bodyfats/123?child_id=${result.child_id}
                    &sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.BODY_FAT.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * DELETE route
     */
    describe('DELETE /v1/children/:child_id/bodyfats/:bodyfat_id', () => {
        context('when the BodyFat was deleted successfully', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for BodyFat', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .delete(`/v1/children/${result.child_id}/bodyfats/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the BodyFat is not found', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for BodyFat', async () => {
                return request
                    .delete(`/v1/children/${defaultBodyFat.child_id}/bodyfats/${defaultBodyFat.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .delete(`/v1/children/123/bodyfats/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the BodyFat id is invalid', () => {
            before(() => {
                try {
                    deleteAllBodyFat()
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid BodyFat id', async () => {
                let result

                try {
                    result = await createBodyFat({
                        timestamp: defaultBodyFat.timestamp,
                        value: defaultBodyFat.value,
                        unit: defaultBodyFat.unit,
                        child_id: defaultBodyFat.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.bodyfats routes test: ' + err.message)
                }

                return request
                    .delete(`/v1/children/${result.child_id}/bodyfats/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.BODY_FAT.PARAM_ID_NOT_VALID_FORMAT)
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

function deleteAllBodyFat(): void {
    MeasurementRepoModel.deleteMany({}, err => {
        if (err) console.log('err: ' + err)
    })
}
