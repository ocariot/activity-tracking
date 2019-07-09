import { assert } from 'chai'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { BodyFat } from '../../../src/application/domain/model/body.fat'

describe('Models: BodyFat', () => {
    const bodyFatJSON: any = {
        type: MeasurementType.BODY_FAT,
        timestamp: new Date().toISOString(),
        value: 23.05,
        unit: '%',
        child_id: '5a62be07de34500146d9c544'
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new BodyFat().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new BodyFat().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an BodyFat model', () => {
                const result = new BodyFat().fromJSON(bodyFatJSON)
                assert.propertyVal(result, 'id', bodyFatJSON.id)
                assert.propertyVal(result, 'type', bodyFatJSON.type)
                assert.equal(result.timestamp!.toISOString(), bodyFatJSON.timestamp)
                assert.propertyVal(result, 'value', bodyFatJSON.value)
                assert.propertyVal(result, 'unit', bodyFatJSON.unit)
                assert.propertyVal(result, 'child_id', bodyFatJSON.child_id)
            })
        })

        context('when the json is undefined', () => {
            it('should return an BodyFat model with all attributes with undefined value', () => {
                const result = new BodyFat().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.propertyVal(result, 'type', MeasurementType.BODY_FAT)
                assert.isUndefined(result.timestamp)
                assert.isUndefined(result.value)
                assert.propertyVal(result, 'unit', '%')
                assert.isUndefined(result.child_id)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return BodyFat model', () => {
                const result = new BodyFat().fromJSON(JSON.stringify(bodyFatJSON))
                assert.propertyVal(result, 'id', bodyFatJSON.id)
                assert.propertyVal(result, 'type', bodyFatJSON.type)
                assert.equal(result.timestamp!.toISOString(), bodyFatJSON.timestamp)
                assert.propertyVal(result, 'value', bodyFatJSON.value)
                assert.propertyVal(result, 'unit', bodyFatJSON.unit)
                assert.propertyVal(result, 'child_id', bodyFatJSON.child_id)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the BodyFat model is correct', () => {
            it('should return a JSON from BodyFat model', () => {
                let result = new BodyFat().fromJSON(bodyFatJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', bodyFatJSON.id)
                assert.equal(result.timestamp!.toISOString(), bodyFatJSON.timestamp)
                assert.propertyVal(result, 'value', bodyFatJSON.value)
                assert.propertyVal(result, 'unit', bodyFatJSON.unit)
                assert.propertyVal(result, 'child_id', bodyFatJSON.child_id)
            })
        })
    })
})
