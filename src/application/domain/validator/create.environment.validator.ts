import { ValidationException } from '../exception/validation.exception'
import { Environment } from '../model/environment'

export class CreateEnvironmentValidator {
    public static validate(environment: Environment): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!environment.institution_id) fields.push('institution_id')
        if (!environment.location) fields.push('location')
        if (!environment.) fields.push('Humidity')

        const location = environment.getLocation()
        if (!location) {
            fields.push('School', 'Room', 'Country', 'and City')
        } else {
            if (!location.getSchool()) fields.push('School')
            if (!location.getRoom()) fields.push('Room')
            if (!location.getCountry()) fields.push('Country')
            if (!location.getCity()) fields.push('City')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Validation of environment measurements failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
