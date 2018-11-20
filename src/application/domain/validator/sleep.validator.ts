import { ValidationException } from '../exception/validation.exception'
import { Sleep } from '../model/sleep'

export class SleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const fields: Array<string> = []

        // validate null

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Sleep validation failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
