import { ObjectID } from 'bson'
import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Environment } from '../../../src/application/domain/model/environment'
import { Location } from '../../../src/application/domain/model/location'
import { TemperatureMock } from '../../mocks/temperature.mock'
import { HumidityMock } from '../../mocks/humidity.mock'

describe('Models: Environment', () => {
    const environmentJSON: any = {
        id: new ObjectID(),
        institution_id: new ObjectID(),
        location: new Location('indoor', 'room 201'),
        temperature: new TemperatureMock(),
        humidity: new HumidityMock(),
        climatized: true,
        timestamp: new Date().toISOString()
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new Environment().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new Environment().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Environment model', () => {
                const result = new Environment().fromJSON(environmentJSON)
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert.propertyVal(result.location, 'local', environmentJSON.location.local)
                assert.propertyVal(result.location, 'room', environmentJSON.location.room)
                assert.propertyVal(result, 'temperature', environmentJSON.temperature)
                assert.propertyVal(result, 'humidity', environmentJSON.humidity)
                assert.typeOf(result.climatized, 'boolean')
                assert.propertyVal(result, 'climatized', environmentJSON.climatized)
                assert.equal(result.timestamp.toISOString(), environmentJSON.timestamp)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Environment model with all attributes with undefined value', () => {
                const result = new Environment().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.isUndefined(result.institution_id)
                assert.isUndefined(result.location)
                assert.isUndefined(result.temperature)
                assert.isUndefined(result.humidity)
                assert.isUndefined(result.climatized)
                assert.isUndefined(result.timestamp)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Environment model', () => {
                const result = new Environment().fromJSON(JSON.stringify(environmentJSON))
                assert.propertyVal(result, 'id', environmentJSON.id.toHexString())
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id.toHexString())
                assert.propertyVal(result.location, 'local', environmentJSON.location.local)
                assert.propertyVal(result.location, 'room', environmentJSON.location.room)
                assert.propertyVal(result.temperature, 'value', environmentJSON.temperature.value)
                assert.propertyVal(result.temperature, 'unit', environmentJSON.temperature.unit)
                assert.propertyVal(result.humidity, 'value', environmentJSON.humidity.value)
                assert.propertyVal(result.humidity, 'unit', environmentJSON.humidity.unit)
                assert.typeOf(result.climatized, 'boolean')
                assert.propertyVal(result, 'climatized', environmentJSON.climatized)
                assert.equal(result.timestamp.toISOString(), environmentJSON.timestamp)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Environment model is correct', () => {
            it('should return a JSON from Environment model', () => {
                let result = new Environment().fromJSON(environmentJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert.propertyVal(result.location, 'local', environmentJSON.location.local)
                assert.propertyVal(result.location, 'room', environmentJSON.location.room)
                assert.propertyVal(result, 'temperature', environmentJSON.temperature)
                assert.propertyVal(result, 'humidity', environmentJSON.humidity)
                assert.typeOf(result.climatized, 'boolean')
                assert.propertyVal(result, 'climatized', environmentJSON.climatized)
                assert.equal(result.timestamp.toISOString(), environmentJSON.timestamp)
            })
        })
    })
})
