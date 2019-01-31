import { ValidationException } from '../exception/validation.exception'
import { Sleep } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'

export class UpdateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        // validate null
        if (sleep.pattern) SleepPatternValidator.validate(sleep.pattern)
    }
}
