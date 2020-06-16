import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Device } from '../../../src/application/domain/model/device'
import { Default } from '../../../src/utils/default'
import { DeviceRepoModel } from '../../../src/infrastructure/database/schema/device.schema'
import { Strings } from '../../../src/utils/strings'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

const deviceMock1: Device = {
    name: 'ESP32',
    type: 'temperature, humidity',
    location: {
        local: 'indoor',
        room: 'Room A10'
    }
} as Device

const deviceMock2: any = {
    name: 'ESP32',
    type: 'temperature',
    address: 'D4:36:39:91:75:70',
    model_number: 'S2-WROVER',
    manufacturer: 'Espressif',
    institution_id: '5a62be07de34500146d9c624',
    location: {
        local: 'indoor',
        room: 'Room A10',
        latitude: '-7.2100766',
        longitude: '-35.9175756'
    }
}

describe('Routes: environments', () => {
    const INST_ID = '5a62be07de34500146d9c624'

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })

                await deleteAllDevices()
            } catch (err) {
                throw new Error('before() - Failure on Device test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('after() - Failure on Device test: ' + err.message)
        }
    })

    afterEach(async () => {
        try {
            await deleteAllDevices()
        } catch (err) {
            throw new Error('afterEach() - Failure on Device test: ' + err.message)
        }
    })

    describe('POST /v1/institutions/:institution_id/devices', () => {
        it('should return status code 201 and the device created with non-mandatory attributes', () => {
            return request
                .post(`/v1/institutions/${INST_ID}/devices`)
                .send(deviceMock1)
                .set('Content-Type', 'application/json')
                .expect(201)
                .then(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body).to.have.property('created_at')
                    expect(res.body).to.have.property('name', deviceMock1.name)
                    expect(res.body).to.be.property('type', deviceMock1.type)
                    expect(res.body.address).to.be.undefined
                    expect(res.body.manufacturer).to.be.undefined
                    expect(res.body.manufacturer).to.be.undefined
                    expect(res.body.location.latitude).to.be.undefined
                    expect(res.body.location.longitude).to.be.undefined
                    expect(res.body.location).to.include(deviceMock1.location)
                })
        })

        it('should return status code 201 and the device created with all attributes', () => {
            return request
                .post(`/v1/institutions/${INST_ID}/devices`)
                .send(deviceMock2)
                .set('Content-Type', 'application/json')
                .expect(201)
                .then(res => {
                    validateDevice(res.body, deviceMock2)
                })
        })

        it('should return status code 400 and message from invalid parameters', () => {
            return request
                .post('/v1/institutions/123/devices')
                .send(deviceMock2)
                .set('Content-Type', 'application/json')
                .expect(400)
                .then(res => {
                    expect(res.body).to.have.property('message', Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                    expect(res.body).to.have.property('description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                })
        })

        it('should return status code 409 with device already registered', () => {
            saveDevices(deviceMock2)
            return request
                .post(`/v1/institutions/${INST_ID}/devices`)
                .send(deviceMock2)
                .set('Content-Type', 'application/json')
                .expect(409)
                .then(res => {
                    expect(res.body).to.have.property('message', Strings.DEVICE.ALREADY_REGISTERED)
                })
        })
    })

    describe('GET /v1/institutions/:institutions_id/devices', () => {
        it('should return status code 200 and a list empty of devices', () => {
            return request
                .get(`/v1/institutions/${INST_ID}/devices`)
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    expect(res.body).is.an.instanceOf(Array)
                    expect(res.body.length).to.eql(0)
                })
        })

        it('should return status code 200 and a list of devices', () => {
            saveDevices(deviceMock2)

            return request
                .get(`/v1/institutions/${INST_ID}/devices`)
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    expect(res.body).is.an.instanceOf(Array)
                    expect(res.body.length).to.eql(1)
                    validateDevice(res.body[0], deviceMock2)
                })
        })

        it('should return status code 400 and message from invalid parameters', () => {
            return request
                .get('/v1/institutions/123456789345678a13451a15aw45a/devices')
                .set('Content-Type', 'application/json')
                .expect(400)
                .then(res => {
                    expect(res.body).to.have.property('message', Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)
                    expect(res.body).to.have.property('description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                })
        })
    })

    describe('GET /v1/institutions/:institutions_id/devices:/device_id', () => {
        it('should return status code 200 and a device', (done) => {
            saveDevices(deviceMock2)
                .then(async (device) => {
                    try {
                        const resultDel = await request.get(`/v1/institutions/${INST_ID}/devices/${device.id}`)
                        expect(resultDel.statusCode).to.eql(200)
                        validateDevice(resultDel.body, deviceMock2)
                        done()
                    } catch (e) {
                        done(e)
                    }
                })
        })

        it('should return status code 400 and message from invalid parameters', () => {
            return request
                .get(`/v1/institutions/${INST_ID}/devices/123`)
                .expect(400)
                .then(res => {
                    expect(res.body).to.have.property('message', Strings.DEVICE.PARAM_ID_NOT_VALID_FORMAT)
                    expect(res.body).to.have.property('description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                })
        })
    })

    describe('DELETE /v1/institutions/:institutions_id/devices:/device_id', () => {
        it('should return status code 204 and no content', (done) => {
            saveDevices(deviceMock1)
                .then(async (device) => {
                    try {
                        const resultDel = await request.delete(`/v1/institutions/${INST_ID}/devices/${device.id}`)
                        const resultGet = await request.get(`/v1/institutions/${INST_ID}/devices`)

                        expect(resultDel.statusCode).to.eql(204)
                        expect(resultDel.body).to.eql({})
                        expect(resultGet.body.length).to.eql(0)
                        done()
                    } catch (e) {
                        done(e)
                    }
                })
        })

        it('should return status code 400 and message from invalid parameters', () => {
            return request
                .delete(`/v1/institutions/${INST_ID}/devices/123`)
                .expect(400)
                .then(res => {
                    expect(res.body).to.have.property('message', Strings.DEVICE.PARAM_ID_NOT_VALID_FORMAT)
                    expect(res.body).to.have.property('description', Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                })
        })
    })
})

function validateDevice(device, expected) {
    expect(device).to.have.property('id')
    expect(device).to.have.property('created_at')
    expect(device).to.have.property('name', expected.name)
    expect(device).to.have.property('type', expected.type)
    expect(device).to.have.property('address', expected.address)
    expect(device).to.have.property('model_number', expected.model_number)
    expect(device).to.have.property('manufacturer', expected.manufacturer)
    expect(device.location).to.include(expected.location)
}

function deleteAllDevices() {
    return DeviceRepoModel.deleteMany({})
}

async function saveDevices(device) {
    return await DeviceRepoModel.create(device)
}

