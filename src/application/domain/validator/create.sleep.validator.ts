import { ValidationException } from '../exception/validation.exception'
import { Sleep, SleepType } from '../model/sleep'
import { SleepPatternValidator } from './sleep.pattern.validator'
import { CreateActivityValidator } from './create.activity.validator'
import { Strings } from '../../../utils/strings'

export class CreateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const fields: Array<string> = []
        const sleepPatternTypes = Object.values(SleepType)

        try {
            // Validate common attributes of the activity.
            CreateActivityValidator.validate(sleep)
        } catch (err) {
            if (err.message !== 'REQUIRED_FIELDS') throw err
            fields.push(err.description.split(','))
        }

        // Validate Sleep attributes
        if (sleep.type === undefined) fields.push('type')
        else if (!sleepPatternTypes.includes(sleep.type)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                `The names of the allowed Sleep Pattern types are: ${sleepPatternTypes.join(', ')}.`)
        }

        if (!sleep.pattern) fields.push('pattern')
        else SleepPatternValidator.validate(sleep.pattern, sleep.type!)

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }
    }
}
