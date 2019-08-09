import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { Log } from '../model/log'
import { LogTypeValidator } from './log.type.validator'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'

export class CreateLogValidator {
    public static validate(childLog: Log): void | ValidationException {
        const fields: Array<string> = []

        // validate null and correct attribute types.
        if (!childLog.type) fields.push('type')
        else LogTypeValidator.validate((childLog.type))
        if (!childLog.date) fields.push('date')
        else DateValidator.validate(childLog.date)
        if (childLog.value === undefined) fields.push('value')
        if (typeof childLog.value === 'string') {
            throw new ValidationException('Value field is invalid...',
                'Child log validation failed: The value received is not a number')
        }
        else if (childLog.value < 0) {
            throw new ValidationException('Value field is invalid...',
                'Child log validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (!childLog.child_id) fields.push('child_id')
        else ObjectIdValidator.validate(childLog.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Child log validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
