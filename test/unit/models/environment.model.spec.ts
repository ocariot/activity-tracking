import { ObjectID } from 'bson'
import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Environment } from '../../../src/application/domain/model/environment'
import { Location } from '../../../src/application/domain/model/location'
import { EnvironmentMock } from '../../mocks/environment.mock'

describe('Models: Environment', () => {
    const environmentJSON: any = {
        id: new ObjectID(),
        institution_id: new ObjectID(),
        location: new Location('indoor', 'room 201'),
        measurements: new EnvironmentMock().measurements,
        climatized: true,
        timestamp: new Date()
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
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert.propertyVal(result.location, 'local', environmentJSON.location.local)
                assert.propertyVal(result.location, 'room', environmentJSON.location.room)
                assert.deepPropertyVal(result, 'measurements', environmentJSON.measurements)
                assert.propertyVal(result, 'climatized', environmentJSON.climatized)
                assert.propertyVal(result, 'timestamp', environmentJSON.timestamp)
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
                assert.propertyVal(result, 'id', environmentJSON.id.toHexString())
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id.toHexString())
                assert.propertyVal(result.location, 'local', environmentJSON.location.local)
                assert.propertyVal(result.location, 'room', environmentJSON.location.room)
                assert.deepPropertyVal(result, 'measurements', environmentJSON.measurements)
                assert.propertyVal(result, 'climatized', environmentJSON.climatized)
                assert.deepPropertyVal(result, 'timestamp', environmentJSON.timestamp)
            })
        })
    })

    describe('toJSON()', () => {
        context('when the Environment model is correct', () => {
            it('should return a JSON from Environment model', () => {
                let result = new Environment().fromJSON(environmentJSON)
                result = result.toJSON()
                assert.propertyVal(result, 'id', environmentJSON.id)
                assert.propertyVal(result, 'institution_id', environmentJSON.institution_id)
                assert.propertyVal(result.location, 'local', environmentJSON.location.local)
                assert.propertyVal(result.location, 'room', environmentJSON.location.room)
                // Measurements
                assert.propertyVal(result.measurements![0], 'type', environmentJSON.measurements[0].type)
                assert.propertyVal(result.measurements![0], 'timestamp', environmentJSON.measurements[0].timestamp)
                assert.propertyVal(result.measurements![0], 'value', environmentJSON.measurements[0].value)
                assert.propertyVal(result.measurements![0], 'unit', environmentJSON.measurements[0].unit)
                assert.propertyVal(result.measurements![0], 'child_id', environmentJSON.measurements[0].child_id)
                assert.propertyVal(result.measurements![1], 'type', environmentJSON.measurements[1].type)
                assert.propertyVal(result.measurements![1], 'timestamp', environmentJSON.measurements[1].timestamp)
                assert.propertyVal(result.measurements![1], 'value', environmentJSON.measurements[1].value)
                assert.propertyVal(result.measurements![1], 'unit', environmentJSON.measurements[1].unit)
                assert.propertyVal(result.measurements![1], 'child_id', environmentJSON.measurements[1].child_id)
                assert.propertyVal(result.measurements![2], 'type', environmentJSON.measurements[2].type)
                assert.propertyVal(result.measurements![2], 'timestamp', environmentJSON.measurements[2].timestamp)
                assert.propertyVal(result.measurements![2], 'value', environmentJSON.measurements[2].value)
                assert.propertyVal(result.measurements![2], 'unit', environmentJSON.measurements[2].unit)
                assert.propertyVal(result.measurements![2], 'child_id', environmentJSON.measurements[2].child_id)
                assert.propertyVal(result, 'climatized', environmentJSON.climatized)
                assert.propertyVal(result, 'timestamp', environmentJSON.timestamp)
            })
        })
    })
})
