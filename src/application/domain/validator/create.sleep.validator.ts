import { ValidationException } from '../exception/validation.exception'
import { Sleep } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'
import { UuidValidator } from './uuid.validator'
import { Strings } from '../../../utils/strings'

export class CreateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!sleep.start_time) fields.push('start_time')
        if (!sleep.end_time) fields.push('end_time')
        if (sleep.duration === undefined) fields.push('duration')
        if (!sleep.child_id) fields.push('child_id')
        else UuidValidator.validate(sleep.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        if (!sleep.pattern) fields.push('pattern')
        else SleepPatternValidator.validate(sleep.pattern)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Sleep validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
