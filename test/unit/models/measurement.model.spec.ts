import { assert } from 'chai'
import { Measurement, MeasurementType } from '../../../src/application/domain/model/measurement'

describe('Models: Measurement', () => {
    const measurementJSON: any = {
        type: MeasurementType.HUMIDITY,
        value: 30.05,
        unit: '%'
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Measurement model', () => {
                const result = new Measurement().fromJSON(measurementJSON)
                assert(result.type, 'type must not be undefined')
                assert.typeOf(result.type, 'string')
                assert.propertyVal(result, 'type', measurementJSON.type)
                assert(result.value, 'value must not be undefined')
                assert.typeOf(result.value, 'number')
                assert.propertyVal(result, 'value', measurementJSON.value)
                assert(result.unit, 'unit must not be undefined')
                assert.typeOf(result.unit, 'string')
                assert.propertyVal(result, 'unit', measurementJSON.unit)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Measurement model with all attributes with undefined value', () => {
                const result = new Measurement().fromJSON(undefined)
                assert.isUndefined(result.type)
                assert.isUndefined(result.value)
                assert.isUndefined(result.unit)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Measurement model', () => {
                const result = new Measurement().fromJSON(JSON.stringify(measurementJSON))
                assert(result.type, 'type must not be undefined')
                assert.typeOf(result.type, 'string')
                assert.propertyVal(result, 'type', measurementJSON.type)
                assert(result.value, 'value must not be undefined')
                assert.typeOf(result.value, 'number')
                assert.propertyVal(result, 'value', measurementJSON.value)
                assert(result.unit, 'unit must not be undefined')
                assert.typeOf(result.unit, 'string')
                assert.propertyVal(result, 'unit', measurementJSON.unit)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Measurement model is correct', () => {
            it('should return a JSON from Measurement model', () => {
                let result = new Measurement().fromJSON(measurementJSON)
                result = result.toJSON()
                assert(result.type, 'type must not be undefined')
                assert.typeOf(result.type, 'string')
                assert.propertyVal(result, 'type', measurementJSON.type)
                assert(result.value, 'value must not be undefined')
                assert.typeOf(result.value, 'number')
                assert.propertyVal(result, 'value', measurementJSON.value)
                assert(result.unit, 'unit must not be undefined')
                assert.typeOf(result.unit, 'string')
                assert.propertyVal(result, 'unit', measurementJSON.unit)
            })
        })
    })
})
