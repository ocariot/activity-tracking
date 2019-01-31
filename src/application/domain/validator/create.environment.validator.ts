import { ValidationException } from '../exception/validation.exception'
import { Environment } from '../model/environment'
import { LocationValidator } from './location.validator'
import { MeasurementsValidator } from './measurements.validator'

export class CreateEnvironmentValidator {
    public static validate(environment: Environment): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!environment.timestamp) fields.push('timestamp')
        if (!environment.institution_id) fields.push('institution_id')
        if (!environment.location) fields.push('location')
        else LocationValidator.validate(environment.location)
        if (!environment.measurements) fields.push('measurements')
        else MeasurementsValidator.validate(environment.measurements)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Validation of environment measurements failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
