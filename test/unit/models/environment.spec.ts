import { ObjectID } from 'bson'
import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Environment } from '../../../src/application/domain/model/environment'
import { Measurement } from '../../../src/application/domain/model/measurement'
import { Location } from '../../../src/application/domain/model/location'

describe('Models: Environment', () => {
    const environmentJSON: any = {
        id: new ObjectID(),
        institution_id: new ObjectID(),
        location: new Location(),
        measurements: new Array<Measurement>(),
        climatized: true,
        timestamp: new Date().toISOString()
    }

    describe('convertDatetimeString(value: string)', () => {
        context('when the parameter is correct', () => {
            it('should normally execute the method', () => {
                const result = new Environment().convertDatetimeString('2018-12-14T12:52:59Z')
                assert.instanceOf(result, Date)
            })
        })

        context('when the parameter is invalid', () => {
            it('should not normally execute the method', () => {
                try {
                    new Environment().convertDatetimeString('2019')
                } catch (err) {
                    assert.instanceOf(err, ValidationException)
                }
            })
        })
    })

    describe('fromJSON(json: any)', () => {
        context('when the json is correct', () => {
            it('should return an Environment model', () => {
                const result = new Environment().fromJSON(environmentJSON)
                assert(result.id, 'Environment id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert(result.institution_id, 'institution_id must not be undefined')
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert(result.location, 'location must not be undefined')
                assert(result.measurements, 'measurements must not be undefined')
                assert.typeOf(result.climatized, 'boolean')
                assert(result.timestamp, 'timestamp must not be undefined')
            })
        })

        context('when the json is undefined', () => {
            it('should return an Environment model with all attributes with undefined value', () => {
                const result = new Environment().fromJSON(undefined)
                assert.isUndefined(result.id)
                assert.isUndefined(result.institution_id)
                assert.isUndefined(result.location)
                assert.isUndefined(result.measurements)
                assert.isUndefined(result.climatized)
                assert.isUndefined(result.timestamp)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return Environment model', () => {
                const result = new Environment().fromJSON(JSON.stringify(environmentJSON))
                assert(result.id, 'Environment id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', environmentJSON.id.toHexString())
                assert(result.institution_id, 'institution_id must not be undefined')
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id.toHexString())
                assert(result.location, 'location must not be undefined')
                assert(result.measurements, 'measurements must not be undefined')
                assert.typeOf(result.climatized, 'boolean')
                assert(result.timestamp, 'timestamp must not be undefined')
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Environment model is correct', () => {
            it('should return a JSON from Environment model', () => {
                let result = new Environment().fromJSON(environmentJSON)
                result = result.toJSON()
                assert(result.id, 'Environment id (id of entity class) must not be undefined')
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert(result.institution_id, 'institution_id must not be undefined')
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert(result.location, 'location must not be undefined')
                assert(result.measurements, 'measurements must not be undefined')
                assert.typeOf(result.climatized, 'boolean')
                assert(result.timestamp, 'timestamp must not be undefined')
            })
        })
    })
})
