import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { ObjectIdValidator } from './object.id.validator'
import { Measurement } from '../model/measurement'
import { NumberValidator } from './number.validator'
import { StringValidator } from './string.validator'

export class CreateMeasurementValidator {
    public static validate(measurement: Measurement): void | ValidationException {
        const fields: Array<string> = []

        // validate null.
        if (measurement.type === undefined) fields.push('type')
        else StringValidator.validate(measurement.type, 'type')

        if (!measurement.timestamp) fields.push('timestamp')

        if (measurement.value === undefined) fields.push('value')
        else NumberValidator.validate(measurement.value, 'value')

        if (measurement.unit === undefined) fields.push('unit')
        else StringValidator.validate(measurement.unit, 'unit')

        if (!measurement.child_id) fields.push('child_id')
        else ObjectIdValidator.validate(measurement.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
