import { ValidationException } from '../exception/validation.exception'
import { Sleep, SleepType } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'
import { NumberValidator } from './number.validator'

export class UpdateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const sleepPatternTypes = Object.values(SleepType)

        if (sleep.child_id) ObjectIdValidator.validate(sleep.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        if (sleep.id) ObjectIdValidator.validate(sleep.id, Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)

        if (sleep.duration !== undefined) NumberValidator.validate(sleep.duration, 'duration')
        if (sleep.start_time && sleep.end_time && sleep.duration) {
            const durationValidate: number = sleep.end_time.getTime() - sleep.start_time.getTime()
            if (durationValidate < 0) {
                throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                    'The end_time parameter can not contain an older date than that the start_time parameter!')
            }
            if (Number(sleep.duration) !== durationValidate) {
                throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                    'duration value does not match values passed in start_time and end_time parameters!')
            }
        }

        if (sleep.type !== undefined && !sleepPatternTypes.includes(sleep.type)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                `The names of the allowed Sleep Pattern types are: ${sleepPatternTypes.join(', ')}.`)
        }
        if (sleep.pattern) SleepPatternValidator.validate(sleep.pattern, sleep.type!)
    }
}
