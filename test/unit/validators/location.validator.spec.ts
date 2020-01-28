import { assert } from 'chai'
import { Location } from '../../../src/application/domain/model/location'
import { LocationValidator } from '../../../src/application/domain/validator/location.validator'
import { Strings } from '../../../src/utils/strings'

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
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'location.local'))
                }
            })
        })

        context('when the location does not have any of the required parameters', () => {
            it('should throw a ValidationException', () => {
                location.room = undefined!
                try {
                    LocationValidator.validate(location)
                } catch (err) {
                    assert.equal(err.message, Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                    assert.equal(err.description, Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                        .replace('{0}', 'location.local, location.room'))
                }
            })
        })
    })
})
