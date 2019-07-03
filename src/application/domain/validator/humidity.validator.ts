import { ValidationException } from '../exception/validation.exception'
import { MeasurementType } from '../model/measurement'
import { Humidity } from '../model/humidity'

export class HumidityValidator {
    public static validate(humidity: Humidity): void | ValidationException {
        const fields: Array<string> = []
        const measurementTypes = Object.values(MeasurementType)

        if (!humidity.type) fields.push('measurement type')
        else if (!measurementTypes.includes(humidity.type)) {
            throw new ValidationException(`The type of humidity measurement provided "${humidity.type}" is not supported...`,
                'The types allowed are: '.concat(Object.values(MeasurementType).join(', '), '.'))
        }
        if (humidity.value === undefined) fields.push('humidity value')
        if (!humidity.unit) fields.push('humidity unit')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Validation of humidity failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
