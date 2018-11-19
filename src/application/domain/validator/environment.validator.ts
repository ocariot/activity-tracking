import { ValidationException } from '../exception/validation.exception'
import { Environment } from '../model/environment'

export class EnvironmentValidator {
    public static validate(environment: Environment): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!environment.getTimestamp()) fields.push('Timestamp')
        if (!environment.getTemperature()) fields.push('Temperature')
        if (!environment.getHumidity()) fields.push('Humidity')
        if (!environment.getLocation()) fields.push('Location')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Validation of environment measurements failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
