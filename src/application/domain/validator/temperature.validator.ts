import { ValidationException } from '../exception/validation.exception'
import { MeasurementType } from '../model/measurement'
import { Temperature } from '../model/temperature'

export class TemperatureValidator {
    public static validate(temperature: Temperature): void | ValidationException {
        const fields: Array<string> = []
        const measurementTypes = Object.values(MeasurementType)

        if (!temperature.type) fields.push('measurement type')
        else if (!measurementTypes.includes(temperature.type)) {
            throw new ValidationException(`The type of temperature measurement provided "${temperature.type}" is not supported...`,
                'The types allowed are: '.concat(Object.values(MeasurementType).join(', '), '.'))
        }
        if (temperature.value === undefined) fields.push('temperature value')
        if (!temperature.unit) fields.push('temperature unit')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Validation of temperature failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
