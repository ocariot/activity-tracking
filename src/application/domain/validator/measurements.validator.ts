import { ValidationException } from '../exception/validation.exception'
import { Measurement, MeasurementType } from '../model/measurement'

export class MeasurementsValidator {
    public static validate(measurements: Array<Measurement>): void | ValidationException {
        const fields: Array<string> = []
        const message: string = 'Measurement are not in a format that is supported!'
        const measurementTypes = Object.values(MeasurementType)

        if (!measurements.length) {
            throw new ValidationException(message, 'The measurements collection must not be empty!')
        }

        measurements.forEach((measurement: Measurement) => {
            // validate null
            if (!measurement.type) fields.push('measurement type')
            else if (!measurementTypes.includes(measurement.type)) {
                throw new ValidationException(`The type of measurement provided "${measurement.type}" is not supported...`,
                    'The types allowed are: '.concat(Object.values(MeasurementType).join(', '), '.'))
            }
            if (measurement.value === undefined) fields.push('measurement value')
            if (!measurement.unit) fields.push('measurement unit')
        })

        if (fields.length > 0) {
            throw new ValidationException(message,
                'Validation of measurements failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
