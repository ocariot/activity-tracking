import { ValidationException } from '../exception/validation.exception'
import { SleepPattern } from '../model/sleep.pattern'
import { SleepPatternDataSetValidator } from './sleep.pattern.dataset.validator'
import { SleepType } from '../model/sleep'
import { Strings } from '../../../utils/strings'

export class SleepPatternValidator {
    public static validate(sleepPattern: SleepPattern, sleepType: SleepType): void | ValidationException {
        // validate null
        if (!sleepPattern.data_set) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS, 'pattern.data_set is required!')
        }
        else SleepPatternDataSetValidator.validate(sleepPattern.data_set, sleepType)
    }
}
