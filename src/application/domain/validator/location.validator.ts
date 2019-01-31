import { ValidationException } from '../exception/validation.exception'
import { Location } from '../model/location'

export class LocationValidator {
    public static validate(location: Location): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!location.local) fields.push('local')
        if (!location.room) fields.push('room')

        if (fields.length > 0) {
            throw new ValidationException('Location are not in a format that is supported!',
                'Validation of location failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
