import { ValidationException } from '../exception/validation.exception'
import { Measurement, MeasurementType } from '../model/measurement'

export class MeasurementValidator {
    public static validate(measurement: Measurement): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!measurement.type) fields.push('type')
        else if (!Object.values(MeasurementType).includes(measurement.type)) {
            throw new ValidationException('The type of measurement provided is not supported...',
                'The types allowed are: '.concat(Object.values(MeasurementType).join(', '), '.'))
        }
        if (measurement.value === undefined) fields.push('value')
        if (!measurement.unit) fields.push('unit')

        if (fields.length > 0) {
            throw new ValidationException('Measurements are not in a format that is supported...',
                'Validation of measurement failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
