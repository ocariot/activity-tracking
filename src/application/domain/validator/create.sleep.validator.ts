import { ValidationException } from '../exception/validation.exception'
import { Sleep } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'
import { CreateActivityValidator } from './create.activity.validator'

export class CreateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const fields: Array<string> = []

        // Validate common attributes of the activity.
        CreateActivityValidator.validate(sleep)

        // Validate Sleep attributes
        if (!sleep.pattern) fields.push('pattern')
        else SleepPatternValidator.validate(sleep.pattern)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Sleep validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
