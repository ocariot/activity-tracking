import { assert } from 'chai'
import { Location } from '../../../src/application/domain/model/location'

describe('Models: Location', () => {
    const locationJSON: any = {
        local: 'indoor',
        room: 'Room 201',
        latitude: '-7.2132',
        longitude: '-34.4321',
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return an Location model', () => {
                const result = new Location().fromJSON(locationJSON)
                assert(result.local, 'local must not be undefined')
                assert.typeOf(result.local, 'string')
                assert.propertyVal(result, 'local', locationJSON.local)
                assert(result.room, 'room must not be undefined')
                assert.typeOf(result.room, 'string')
                assert.propertyVal(result, 'room', locationJSON.room)
                assert.typeOf(result.latitude, 'string')
                assert.propertyVal(result, 'latitude', locationJSON.latitude)
                assert.typeOf(result.longitude, 'string')
                assert.propertyVal(result, 'longitude', locationJSON.longitude)
            })
        })

        context('when the json is undefined', () => {
            it('should return an Location model with all attributes with undefined value', () => {
                const result = new Location().fromJSON(undefined)
                assert.isUndefined(result.local)
                assert.isUndefined(result.room)
                assert.isUndefined(result.latitude)
                assert.isUndefined(result.longitude)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Location model', () => {
                const result = new Location().fromJSON(JSON.stringify(locationJSON))
                assert(result.local, 'local must not be undefined')
                assert.typeOf(result.local, 'string')
                assert.propertyVal(result, 'local', locationJSON.local)
                assert(result.room, 'room must not be undefined')
                assert.typeOf(result.room, 'string')
                assert.propertyVal(result, 'room', locationJSON.room)
                assert.typeOf(result.latitude, 'string')
                assert.propertyVal(result, 'latitude', locationJSON.latitude)
                assert.typeOf(result.longitude, 'string')
                assert.propertyVal(result, 'longitude', locationJSON.longitude)
            })
        })
    })

    describe('toJSON()', () => {
        it('should return a JSON from Location model', () => {
            let result = new Location().fromJSON(locationJSON)
            result = result.toJSON()
            assert(result.local, 'local must not be undefined')
            assert.typeOf(result.local, 'string')
            assert.propertyVal(result, 'local', locationJSON.local)
            assert(result.room, 'room must not be undefined')
            assert.typeOf(result.room, 'string')
            assert.propertyVal(result, 'room', locationJSON.room)
            assert.typeOf(result.latitude, 'string')
            assert.propertyVal(result, 'latitude', locationJSON.latitude)
            assert.typeOf(result.longitude, 'string')
            assert.propertyVal(result, 'longitude', locationJSON.longitude)
        })
    })
})
