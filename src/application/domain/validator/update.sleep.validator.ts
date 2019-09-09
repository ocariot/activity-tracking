import { ValidationException } from '../exception/validation.exception'
import { Sleep, SleepType } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'

export class UpdateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const sleepPatternTypes = Object.values(SleepType)

        if (sleep.child_id) ObjectIdValidator.validate(sleep.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        if (sleep.id) ObjectIdValidator.validate(sleep.id, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
        if (sleep.duration && sleep.duration < 0) {
            throw new ValidationException('Duration field is invalid...',
                'Sleep validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (sleep.type && !sleepPatternTypes.includes(sleep.type)) {
            throw new ValidationException(`The type provided "${sleep.type}" is not supported...`,
                `The allowed Sleep Pattern types are: ${sleepPatternTypes.join(', ')}.`)
        }
        if (sleep.pattern) SleepPatternValidator.validate(sleep.pattern, sleep.type!)
    }
}
