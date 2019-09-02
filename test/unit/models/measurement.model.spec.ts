import { assert } from 'chai'
import { Measurement, MeasurementType } from '../../../src/application/domain/model/measurement'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'

describe('Models: Measurement', () => {
    const measurementJSON: any = {
        type: MeasurementType.HUMIDITY,
        timestamp: new Date(),
        value: 30.05,
        unit: '%',
        child_id: '5a62be07de34500146d9c544'
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new Measurement().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new Measurement().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Measurement model', () => {
                const result = new Measurement().fromJSON(measurementJSON)
                assert.propertyVal(result, 'id', measurementJSON.id)
                assert.propertyVal(result, 'type', measurementJSON.type)
                assert.propertyVal(result, 'timestamp', measurementJSON.timestamp)
                assert.propertyVal(result, 'value', measurementJSON.value)
                assert.propertyVal(result, 'unit', measurementJSON.unit)
                assert.propertyVal(result, 'child_id', measurementJSON.child_id)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Measurement model with all attributes with undefined value', () => {
                const result = new Measurement().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.isUndefined(result.type)
                assert.isUndefined(result.timestamp)
                assert.isUndefined(result.value)
                assert.isUndefined(result.unit)
                assert.isUndefined(result.child_id)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Measurement model', () => {
                const result = new Measurement().fromJSON(JSON.stringify(measurementJSON))
                assert.propertyVal(result, 'id', measurementJSON.id)
                assert.propertyVal(result, 'type', measurementJSON.type)
                assert.deepPropertyVal(result, 'timestamp', measurementJSON.timestamp)
                assert.propertyVal(result, 'value', measurementJSON.value)
                assert.propertyVal(result, 'unit', measurementJSON.unit)
                assert.propertyVal(result, 'child_id', measurementJSON.child_id)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Measurement model is correct', () => {
            it('should return a JSON from Measurement model', () => {
                let result = new Measurement().fromJSON(measurementJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', measurementJSON.id)
                assert.propertyVal(result, 'type', measurementJSON.type)
                assert.propertyVal(result, 'timestamp', measurementJSON.timestamp)
                assert.propertyVal(result, 'value', measurementJSON.value)
                assert.propertyVal(result, 'unit', measurementJSON.unit)
                assert.propertyVal(result, 'child_id', measurementJSON.child_id)
            })
        })
    })
})
