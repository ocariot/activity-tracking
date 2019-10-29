import { ValidationException } from '../exception/validation.exception'
import { Location } from '../model/location'
import { StringValidator } from './string.validator'
import { Strings } from '../../../utils/strings'

export class LocationValidator {
    public static validate(location: Location): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (location.local === undefined) fields.push('location.local')
        else StringValidator.validate(location.local, 'location.local')

        if (location.room === undefined) fields.push('location.room')
        else StringValidator.validate(location.room, 'location.room')

        if (location.latitude !== undefined) StringValidator.validate(location.latitude, 'location.latitude')
        if (location.longitude !== undefined) StringValidator.validate(location.longitude, 'location.longitude')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
