import { ValidationException } from '../exception/validation.exception'
import { Environment } from '../model/environment'
import { LocationValidator } from './location.validator'
import { ObjectIdValidator } from './object.id.validator'
import { Measurement } from '../model/measurement'
import { Strings } from '../../../utils/strings'

export class CreateEnvironmentValidator {
    public static validate(environment: Environment): void | ValidationException {
        const fields: Array<string> = []
        const message: string = 'Measurement are not in a format that is supported!'

        // validate null
        if (!environment.timestamp) fields.push('timestamp')
        if (!environment.institution_id) fields.push('institution_id')
        else ObjectIdValidator.validate(environment.institution_id)
        if (!environment.location) fields.push('location')
        else LocationValidator.validate(environment.location)
        if (!environment.measurements) fields.push('measurements')
        else if (!environment.measurements.length) {
            throw new ValidationException(message, 'The measurements collection must not be empty!')
        }
        else {
            environment.measurements.forEach((measurement: Measurement) => {
                // validate null
                if (!measurement.type) fields.push('measurement type')
                if (measurement.value === undefined) fields.push('measurement value')
                else if (isNaN(measurement.value)) {
                    throw new ValidationException('Measurement value field is invalid...',
                        'Validation of environment failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
                }
                if (!measurement.unit) fields.push('measurement unit')
            })
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Validation of environment failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
