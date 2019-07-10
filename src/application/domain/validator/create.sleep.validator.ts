import { ValidationException } from '../exception/validation.exception'
import { Sleep, SleepType } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'
import { CreateActivityValidator } from './create.activity.validator'

export class CreateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const fields: Array<string> = []
        const sleepPatternTypes = Object.values(SleepType)

        // Validate common attributes of the activity.
        CreateActivityValidator.validate(sleep)

        // Validate Sleep attributes
        if (!sleep.type) fields.push('type')
        else if (!sleepPatternTypes.includes(sleep.type)) {
            throw new ValidationException(`The type provided "${sleep.type}" is not supported...`,
                `The allowed Sleep Pattern types are: ${sleepPatternTypes.join(', ')}.`)
        }

        if (!sleep.pattern) fields.push('pattern')
        else SleepPatternValidator.validate(sleep.pattern, sleep.type!)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Sleep validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
