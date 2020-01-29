import { ValidationException } from '../exception/validation.exception'
import { Environment } from '../model/environment'
import { LocationValidator } from './location.validator'
import { ObjectIdValidator } from './object.id.validator'
import { Measurement } from '../model/measurement'
import { Strings } from '../../../utils/strings'
import { StringValidator } from './string.validator'

export class CreateEnvironmentValidator {
    public static validate(environment: Environment): void | ValidationException {
        const fields: Array<string> = []

        const regZone = new RegExp(/^-*[0-9]{1,}(\.\d{1,})?$/i) // 1-n (positive or negative)

        // validate null
        if (!environment.timestamp) fields.push('timestamp')

        if (environment.institution_id === undefined) fields.push('institution_id')
        else ObjectIdValidator.validate(environment.institution_id, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)

        if (!environment.location) fields.push('location')
        else LocationValidator.validate(environment.location)

        if (!environment.measurements) fields.push('measurements')
        else if (!environment.measurements.length) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                'measurements collection must not be empty!')
        }
        else {
            environment.measurements.forEach((measurement: Measurement) => {
                // validate null
                if (measurement.type === undefined) fields.push('measurements.type')
                else StringValidator.validate(measurement.type, 'measurements.type')

                if (measurement.value === undefined) fields.push('measurements.value')
                else if (!(regZone.test(String(measurement.value)))) {
                    throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                        Strings.ERROR_MESSAGE.INVALID_NUMBER.replace('{0}', 'measurements.value'))
                }

                if (measurement.unit === undefined) fields.push('measurements.unit')
                else StringValidator.validate(measurement.unit, 'measurements.unit')
            })
        }

        if (environment.climatized !== undefined && typeof environment.climatized !== 'boolean') {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS, 'climatized must be a boolean!')
        }

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }
    }
}
