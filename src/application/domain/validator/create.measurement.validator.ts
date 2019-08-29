import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { ObjectIdValidator } from './object.id.validator'
import { Measurement, MeasurementType } from '../model/measurement'

export class CreateMeasurementValidator {
    public static validate(measurement: Measurement): void | ValidationException {
        const fields: Array<string> = []
        const measurementTypes: Array<string> = Object.values(MeasurementType)

        // validate null.
        if (!measurement.type) fields.push('type')
        else if (!measurementTypes.includes(measurement.type)) {
            throw new ValidationException(`The type of measurement provided "${measurement.type}" is not supported...`,
                `The allowed types are: ${measurementTypes.join(', ')}.`)
        }
        if (!measurement.timestamp) fields.push('timestamp')
        if (measurement.value === undefined) fields.push('value')
        if (!measurement.unit) fields.push('unit')

        if (!measurement.child_id) fields.push('child_id')
        else ObjectIdValidator.validate(measurement.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Measurement validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
