import { Device } from '../../../src/application/domain/model/device'
import { assert } from 'chai'

const deviceMock: Device = new Device().fromJSON({
    id: '5ca790f75d2f5766d993103a',
    name: 'ESP32',
    type: 'temperature',
    address: 'D4:36:39:91:75:70',
    model_number: 'S2-WROVER',
    manufacturer: 'Espressif',
    location: {
        local: 'indoor',
        room: 'Room A10',
        latitude: '-7.2100766',
        longitude: '-35.9175756'
    },
})
deviceMock.institutionId = '5a62be07de34500146d9c624'
deviceMock.createdAt = new Date().toISOString()

describe('Models: Device', () => {
    context('fromJSON()', () => {
        it('should return a model with json parameters', () => {
            const result = deviceMock
            assert.equal(result.institutionId, deviceMock.institutionId)
            validateDevice(result.toJSON(), deviceMock.toJSON())
        })

        it('should return a model with set parameters', () => {
            const result = new Device().fromJSON(JSON.stringify(deviceMock))
            assert.isUndefined(result.institutionId)
            validateDevice(result.toJSON(), deviceMock.toJSON())
        })

        it('should return a model with undefined parameters', () => {
            validateUndefined(new Device().fromJSON(''))
        })

        it('should return a model with undefined parameters', () => {
            validateUndefined(new Device().fromJSON('invalid'))
        })

        it('should return a model with undefined parameters', () => {
            validateUndefined(new Device().fromJSON(undefined))
        })

        it('should return a model with undefined parameters', () => {
            validateUndefined(new Device().fromJSON({}))
        })
    })

    describe('toJSON()', () => {
        it('should return a json with model parameters', () => {
            const result = deviceMock.toJSON()
            validateDevice(result, deviceMock.toJSON())
            assert.propertyVal(result, 'created_at', deviceMock.createdAt)
        })

        context('when the model does not have defined parameters', () => {
            it('should return json with undefined parameters', () => {
                validateUndefined(new Device().toJSON())
            })
        })
    })
})

function validateDevice(result, expected) {
    assert.propertyVal(result, 'name', expected.name)
    assert.propertyVal(result, 'address', expected.address)
    assert.propertyVal(result, 'type', expected.type)
    assert.propertyVal(result, 'model_number', expected.model_number)
    assert.propertyVal(result, 'manufacturer', expected.manufacturer)
    assert.deepEqual(result.location, expected.location)
}

function validateUndefined(result) {
    assert.isUndefined(result.name)
    assert.isUndefined(result.address)
    assert.isUndefined(result.type)
    assert.isUndefined(result.model_number)
    assert.isUndefined(result.manufacturer)
    assert.isUndefined(result.location)
    assert.isUndefined(result.institution_id)
}
