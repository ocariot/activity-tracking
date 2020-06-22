import { Device } from '../../../src/application/domain/model/device'
import { DeviceEntityMapper } from '../../../src/infrastructure/entity/mapper/device.entity.mapper'
import { assert } from 'chai'
import { DeviceEntity } from '../../../src/infrastructure/entity/device.entity'

describe('Mappers: DeviceEntityMapper', () => {
    const mapper: DeviceEntityMapper = new DeviceEntityMapper()
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
        }
    })
    deviceMock.institutionId = '5a62be07de34500146d9c624'

    describe('transform()', () => {
        context('when the parameter is a json', () => {
            it('should call the jsonToModel() method', () => {
                const result = mapper.transform(deviceMock.toJSON())
                validateDevice(result.toJSON(), deviceMock.toJSON())
            })

            it('should return model without parameters for empty json', () => {
                validateUndefined(mapper.transform({}))
            })

            it('should return model without parameter for undefined json', () => {
                validateUndefined(mapper.transform(undefined))
            })
        })

        context('when the parameter is a model', () => {
            it('should call the modelToModelEntity() method', () => {
                const result = mapper.transform(deviceMock)
                validateDevice(result, deviceMock.toJSON())
                assert.propertyVal(result, 'institution_id', deviceMock.institutionId)
            })

            it('should return a model entity with basic parameters for empty model', () => {
                const result = mapper.transform(new Device())
                assert.isEmpty(result)
            })
        })
    })

    describe('modelEntityToModel()', () => {
        context('when try to use modelEntityToModel() function', () => {
            it('should throw an error', () => {
                try {
                    mapper.modelEntityToModel(new DeviceEntity())
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Not implemented!')
                }
            })
        })
    })
})

function validateUndefined(result) {
    assert.isUndefined(result.name)
    assert.isUndefined(result.address)
    assert.isUndefined(result.type)
    assert.isUndefined(result.model_number)
    assert.isUndefined(result.manufacturer)
    assert.isUndefined(result.location)
    assert.isUndefined(result.institution_id)
}

function validateDevice(result, expected) {
    assert.propertyVal(result, 'name', expected.name)
    assert.propertyVal(result, 'type', expected.type)
    assert.propertyVal(result, 'address', expected.address)
    assert.propertyVal(result, 'model_number', expected.model_number)
    assert.propertyVal(result, 'manufacturer', expected.manufacturer)
    assert.deepEqual(result.location, expected.location)
}
