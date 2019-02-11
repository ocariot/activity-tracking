import { ValidationException } from '../exception/validation.exception'
import { Sleep } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'
import { UuidValidator } from './uuid.validator'
import { Strings } from '../../../utils/strings'

export class UpdateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        if (sleep.child_id) UuidValidator.validate(sleep.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        if (sleep.id) UuidValidator.validate(sleep.id, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
        if (sleep.pattern) SleepPatternValidator.validate(sleep.pattern)
    }
}
