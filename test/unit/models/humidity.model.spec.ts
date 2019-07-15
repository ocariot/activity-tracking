import { assert } from 'chai'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { Humidity } from '../../../src/application/domain/model/humidity'

describe('Models: Humidity', () => {
    const humidityJSON: any = {
        type: MeasurementType.HUMIDITY,
        value: 38,
        unit: '%'
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Humidity model', () => {
                const result = new Humidity().fromJSON(humidityJSON)
                assert.propertyVal(result, 'id', humidityJSON.id)
                assert.propertyVal(result, 'type', humidityJSON.type)
                assert.propertyVal(result, 'value', humidityJSON.value)
                assert.propertyVal(result, 'unit', humidityJSON.unit)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Humidity model with all attributes with undefined value', () => {
                const result = new Humidity().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.propertyVal(result, 'type', MeasurementType.HUMIDITY)
                assert.isUndefined(result.value)
                assert.isUndefined(result.unit)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Humidity model', () => {
                const result = new Humidity().fromJSON(JSON.stringify(humidityJSON))
                assert.propertyVal(result, 'id', humidityJSON.id)
                assert.propertyVal(result, 'type', humidityJSON.type)
                assert.propertyVal(result, 'value', humidityJSON.value)
                assert.propertyVal(result, 'unit', humidityJSON.unit)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Humidity model is correct', () => {
            it('should return a JSON from Humidity model', () => {
                let result = new Humidity().fromJSON(humidityJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', humidityJSON.id)
                assert.propertyVal(result, 'type', humidityJSON.type)
                assert.propertyVal(result, 'value', humidityJSON.value)
                assert.propertyVal(result, 'unit', humidityJSON.unit)
            })
        })
    })
})
