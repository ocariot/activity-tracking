import { assert } from 'chai'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { Temperature } from '../../../src/application/domain/model/temperature'

describe('Models: Temperature', () => {
    const temperatureJSON: any = {
        type: MeasurementType.TEMPERATURE,
        value: 33,
        unit: 'C'
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Temperature model', () => {
                const result = new Temperature().fromJSON(temperatureJSON)
                assert.propertyVal(result, 'id', temperatureJSON.id)
                assert.propertyVal(result, 'type', temperatureJSON.type)
                assert.propertyVal(result, 'value', temperatureJSON.value)
                assert.propertyVal(result, 'unit', temperatureJSON.unit)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Temperature model with all attributes with undefined value', () => {
                const result = new Temperature().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.propertyVal(result, 'type', MeasurementType.TEMPERATURE)
                assert.isUndefined(result.value)
                assert.isUndefined(result.unit)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Temperature model', () => {
                const result = new Temperature().fromJSON(JSON.stringify(temperatureJSON))
                assert.propertyVal(result, 'id', temperatureJSON.id)
                assert.propertyVal(result, 'type', temperatureJSON.type)
                assert.propertyVal(result, 'value', temperatureJSON.value)
                assert.propertyVal(result, 'unit', temperatureJSON.unit)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Temperature model is correct', () => {
            it('should return a JSON from Temperature model', () => {
                let result = new Temperature().fromJSON(temperatureJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', temperatureJSON.id)
                assert.propertyVal(result, 'type', temperatureJSON.type)
                assert.propertyVal(result, 'value', temperatureJSON.value)
                assert.propertyVal(result, 'unit', temperatureJSON.unit)
            })
        })
    })
})
