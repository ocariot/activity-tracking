import { assert } from 'chai'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Weight } from '../../../src/application/domain/model/weight'
import { BodyFat } from '../../../src/application/domain/model/body.fat'

describe('Models: Weight', () => {
    const weightJSON: any = {
        type: MeasurementType.WEIGHT,
        timestamp: new Date(),
        value: 62,
        unit: 'kg',
        child_id: '5a62be07de34500146d9c544',
        body_fat: 20.1
    }

    const bodyFatMock = new BodyFat().fromJSON(weightJSON)
    bodyFatMock.value = weightJSON.body_fat

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new Weight().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new Weight().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Weight model', () => {
                const result = new Weight().fromJSON(weightJSON)
                assert.propertyVal(result, 'id', weightJSON.id)
                assert.propertyVal(result, 'type', weightJSON.type)
                assert.propertyVal(result, 'timestamp', weightJSON.timestamp)
                assert.propertyVal(result, 'value', weightJSON.value)
                assert.propertyVal(result, 'unit', weightJSON.unit)
                assert.propertyVal(result, 'child_id', weightJSON.child_id)
                assert.deepPropertyVal(result, 'body_fat', bodyFatMock)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Weight model with all attributes with undefined value', () => {
                const result = new Weight().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.propertyVal(result, 'type', MeasurementType.WEIGHT)
                assert.isUndefined(result.timestamp)
                assert.isUndefined(result.value)
                assert.isUndefined(result.unit)
                assert.isUndefined(result.child_id)
                assert.isUndefined(result.body_fat)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Weight model', () => {
                const result = new Weight().fromJSON(JSON.stringify(weightJSON))
                assert.propertyVal(result, 'id', weightJSON.id)
                assert.propertyVal(result, 'type', weightJSON.type)
                assert.deepPropertyVal(result, 'timestamp', weightJSON.timestamp)
                assert.propertyVal(result, 'value', weightJSON.value)
                assert.propertyVal(result, 'unit', weightJSON.unit)
                assert.propertyVal(result, 'child_id', weightJSON.child_id)
                assert.deepPropertyVal(result, 'body_fat', bodyFatMock)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Weight model is correct', () => {
            it('should return a JSON from Weight model', () => {
                let result = new Weight().fromJSON(weightJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', weightJSON.id)
                assert.propertyVal(result, 'timestamp', weightJSON.timestamp.toISOString().substr(0, 19))
                assert.propertyVal(result, 'value', weightJSON.value)
                assert.propertyVal(result, 'unit', weightJSON.unit)
                assert.propertyVal(result, 'child_id', weightJSON.child_id)
                assert.propertyVal(result, 'body_fat', weightJSON.body_fat)
            })
        })
    })
})
