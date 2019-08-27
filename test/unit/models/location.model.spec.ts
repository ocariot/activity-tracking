import { assert } from 'chai'
import { Location } from '../../../src/application/domain/model/location'

describe('Models: Location', () => {
    const locationJSON: any = {
        local: 'indoor',
        room: 'Room 201',
        latitude: '-7.2132',
        longitude: '-34.4321',
    }

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Location model', () => {
                const result = new Location().fromJSON(locationJSON)
                assert.propertyVal(result, 'local', locationJSON.local)
                assert.propertyVal(result, 'room', locationJSON.room)
                assert.propertyVal(result, 'latitude', locationJSON.latitude)
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
                assert.propertyVal(result, 'local', locationJSON.local)
                assert.propertyVal(result, 'room', locationJSON.room)
                assert.propertyVal(result, 'latitude', locationJSON.latitude)
                assert.propertyVal(result, 'longitude', locationJSON.longitude)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Location model is correct', () => {
            it('should return a JSON from Location model', () => {
                let result = new Location(locationJSON.local, locationJSON.room, locationJSON.latitude, locationJSON.longitude)
                result = result.toJSON()
                assert.propertyVal(result, 'local', locationJSON.local)
                assert.propertyVal(result, 'room', locationJSON.room)
                assert.propertyVal(result, 'latitude', locationJSON.latitude)
                assert.propertyVal(result, 'longitude', locationJSON.longitude)
            })
        })
    })
})
