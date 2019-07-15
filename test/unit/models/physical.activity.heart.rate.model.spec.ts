import { assert } from 'chai'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'

describe('Models: PhysicalActivityHeartRate', () => {
    const activityHeartRateJSON: any = {
        average: 91,
        out_of_range_zone: {
            min: 30,
            max: 91,
            duration: 0
        },
        fat_burn_zone: {
            min: 91,
            max: 127,
            duration: 10
        },
        cardio_zone: {
            min: 127,
            max: 154,
            duration: 0
        },
        peak_zone: {
            min: 154,
            max: 220,
            duration: 0
        }
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an PhysicalActivityHeartRate model', () => {
                const result = new PhysicalActivityHeartRate().fromJSON(activityHeartRateJSON)
                assert.deepPropertyVal(result, 'average', activityHeartRateJSON.average)
                assert.deepPropertyVal(result, 'out_of_range_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.out_of_range_zone))
                assert.deepPropertyVal(result, 'fat_burn_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.fat_burn_zone))
                assert.deepPropertyVal(result, 'cardio_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.cardio_zone))
                assert.deepPropertyVal(result, 'peak_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.peak_zone))
            })
        })

        context('when the json is undefined', () => {
            it('should return an PhysicalActivityHeartRate model with all attributes with undefined value', () => {
                const result = new PhysicalActivityHeartRate().fromJSON(undefined)
                assert.isUndefined(result.average)
                assert.isUndefined(result.out_of_range_zone)
                assert.isUndefined(result.fat_burn_zone)
                assert.isUndefined(result.cardio_zone)
                assert.isUndefined(result.peak_zone)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return PhysicalActivityHeartRate model', () => {
                const result = new PhysicalActivityHeartRate().fromJSON(JSON.stringify(activityHeartRateJSON))
                assert.deepPropertyVal(result, 'average', activityHeartRateJSON.average)
                assert.deepPropertyVal(result, 'out_of_range_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.out_of_range_zone))
                assert.deepPropertyVal(result, 'fat_burn_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.fat_burn_zone))
                assert.deepPropertyVal(result, 'cardio_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.cardio_zone))
                assert.deepPropertyVal(result, 'peak_zone', new HeartRateZone().fromJSON(activityHeartRateJSON.peak_zone))
            })
        })
    })

    describe('toJSON()', () => {
        context('when the PhysicalActivityHeartRate model is correct', () => {
            it('should return a JSON from PhysicalActivityHeartRate model', () => {
                let result = new PhysicalActivityHeartRate().fromJSON(activityHeartRateJSON)
                result = result.toJSON()
                assert.deepPropertyVal(result, 'average', activityHeartRateJSON.average)
                assert.deepPropertyVal(result, 'out_of_range_zone', activityHeartRateJSON.out_of_range_zone)
                assert.deepPropertyVal(result, 'fat_burn_zone', activityHeartRateJSON.fat_burn_zone)
                assert.deepPropertyVal(result, 'cardio_zone', activityHeartRateJSON.cardio_zone)
                assert.deepPropertyVal(result, 'peak_zone', activityHeartRateJSON.peak_zone)
            })
        })
    })
})
