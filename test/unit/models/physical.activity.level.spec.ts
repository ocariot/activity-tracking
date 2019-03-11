import { assert } from 'chai'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'

describe('Models: PhysicalActivityLevel', () => {
    const activityLevelJSON: any = {
        name: ActivityLevelType.FAIRLY,
        duration: 200
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an PhysicalActivityLevel model', () => {
                const result = new PhysicalActivityLevel().fromJSON(activityLevelJSON)
                assert(result.name, 'name must not be undefined')
                assert.typeOf(result.name, 'string')
                assert.propertyVal(result, 'name', activityLevelJSON.name)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activityLevelJSON.duration)
            })
        })

        context('when the json is undefined', () => {
            it('should return an PhysicalActivityLevel model with all attributes with undefined value', () => {
                const result = new PhysicalActivityLevel().fromJSON(undefined)
                assert.isUndefined(result.name)
                assert.isUndefined(result.duration)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return PhysicalActivityLevel model', () => {
                const result = new PhysicalActivityLevel().fromJSON(JSON.stringify(activityLevelJSON))
                assert(result.name, 'name must not be undefined')
                assert.typeOf(result.name, 'string')
                assert.propertyVal(result, 'name', activityLevelJSON.name)
                assert(result.duration, 'duration must not be undefined')
                assert.typeOf(result.duration, 'number')
                assert.propertyVal(result, 'duration', activityLevelJSON.duration)
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from PhysicalActivityLevel model', () => {
            let result = new PhysicalActivityLevel().fromJSON(activityLevelJSON)
            result = result.toJSON()
            assert(result.name, 'name must not be undefined')
            assert.typeOf(result.name, 'string')
            assert.propertyVal(result, 'name', activityLevelJSON.name)
            assert(result.duration, 'duration must not be undefined')
            assert.typeOf(result.duration, 'number')
            assert.propertyVal(result, 'duration', activityLevelJSON.duration)
        })
    })
})
