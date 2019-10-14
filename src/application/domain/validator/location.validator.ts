import { ValidationException } from '../exception/validation.exception'
import { Location } from '../model/location'

export class LocationValidator {
    public static validate(location: Location): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (location.local === undefined) fields.push('location local')
        else if (location.local.length === 0) {
            throw new ValidationException('Location local field is invalid...',
                'Validation of location failed: Location local must have at least one character.')
        }
        if (location.room === undefined) fields.push('location room')
        else if (location.room.length === 0) {
            throw new ValidationException('Location room field is invalid...',
                'Validation of location failed: Location room must have at least one character.')
        }

        if (fields.length > 0) {
            throw new ValidationException('Location are not in a format that is supported...',
                'Validation of location failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
