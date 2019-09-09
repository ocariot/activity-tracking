import { assert } from 'chai'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'

describe('Models: HeartRateZone', () => {
    const heartRateZoneJSON: any = {
        min: 91,
        max: 127,
        duration: 600000,
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an HeartRateZone model', () => {
                const result = new HeartRateZone().fromJSON(heartRateZoneJSON)
                assert.deepPropertyVal(result, 'min', heartRateZoneJSON.min)
                assert.deepPropertyVal(result, 'max', heartRateZoneJSON.max)
                assert.deepPropertyVal(result, 'duration', heartRateZoneJSON.duration)
            })
        })

        context('when the json is undefined', () => {
            it('should return an HeartRateZone model with all attributes with undefined value', () => {
                const result = new HeartRateZone().fromJSON(undefined)
                assert.isUndefined(result.min)
                assert.isUndefined(result.max)
                assert.isUndefined(result.duration)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return HeartRateZone model', () => {
                const result = new HeartRateZone().fromJSON(JSON.stringify(heartRateZoneJSON))
                assert.deepPropertyVal(result, 'min', heartRateZoneJSON.min)
                assert.deepPropertyVal(result, 'max', heartRateZoneJSON.max)
                assert.deepPropertyVal(result, 'duration', heartRateZoneJSON.duration)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the HeartRateZone model is correct', () => {
            it('should return a JSON from HeartRateZone model', () => {
                let result = new HeartRateZone().fromJSON(heartRateZoneJSON)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'min', heartRateZoneJSON.min)
                assert.deepPropertyVal(result, 'max', heartRateZoneJSON.max)
                assert.deepPropertyVal(result, 'duration', heartRateZoneJSON.duration)
            })
        })
    })
})
