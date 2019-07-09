import { ValidationException } from '../exception/validation.exception'
import { Environment } from '../model/environment'
import { LocationValidator } from './location.validator'
import { ObjectIdValidator } from './object.id.validator'
import { MeasurementType } from '../model/measurement'

export class CreateEnvironmentValidator {
    public static validate(environment: Environment): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!environment.timestamp) fields.push('timestamp')
        if (!environment.institution_id) fields.push('institution_id')
        else ObjectIdValidator.validate(environment.institution_id)
        if (!environment.location) fields.push('location')
        else LocationValidator.validate(environment.location)
        if (!environment.temperature) fields.push('temperature')
        else {
            if (environment.temperature.type !== MeasurementType.TEMPERATURE) {
                throw new ValidationException(`The type of temperature provided "${environment.temperature.type}" is not supported...`,
                    'The type allowed is "'.concat(MeasurementType.TEMPERATURE).concat('".'))
            }
            if (environment.temperature.value === undefined) fields.push('temperature.value')
            if (!environment.temperature.unit) fields.push('temperature.unit')
        }

        if (environment.humidity) {
            if (environment.humidity.type !== MeasurementType.HUMIDITY) {
                throw new ValidationException(`The type of humidity provided "${environment.humidity.type}" is not supported...`,
                    'The type allowed is: "'.concat(MeasurementType.HUMIDITY).concat('".'))
            }
            if (environment.humidity.value === undefined) fields.push('humidity.value')
            if (!environment.humidity.unit) fields.push('humidity.unit')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Validation of environment failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
