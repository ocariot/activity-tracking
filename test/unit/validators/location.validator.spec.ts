import { assert } from 'chai'
import { Location } from '../../../src/application/domain/model/location'
import { LocationValidator } from '../../../src/application/domain/validator/location.validator'

const location: Location = new Location()
location.local = 'indoor'
location.room = 'Room 201'

describe('Validators: LocationValidator', () => {
    describe('validate(location: Location)', () => {
        context('when the location has all the required parameters, and that they have valid values', () => {
            it('should return undefined representing the success of the validation', () => {
                const result = LocationValidator.validate(location)
                assert.equal(result, undefined)
            })
        })

        context('when the location does not have all the required parameters (in this case missing local)', () => {
            it('should throw a ValidationException', () => {
                location.local = undefined!
                try {
                    LocationValidator.validate(location)
                } catch (err) {
                    assert.equal(err.message, 'Location are not in a format that is supported...')
                    assert.equal(err.description, 'Validation of location failed: location local is required!')
                }
            })
        })

        context('when the location does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                location.room = undefined!
                try {
                    LocationValidator.validate(location)
                } catch (err) {
                    assert.equal(err.message, 'Location are not in a format that is supported...')
                    assert.equal(err.description, 'Validation of location failed: location local, location room is required!')
                }
            })
        })
    })
})
