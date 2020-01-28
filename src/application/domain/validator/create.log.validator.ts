import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { Log } from '../model/log'
import { LogTypeValidator } from './log.type.validator'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'
import { NumberValidator } from './number.validator'

export class CreateLogValidator {
    public static validate(childLog: Log): void | ValidationException {
        const fields: Array<string> = []

        // validate null and correct attribute types.
        if (!childLog.type) fields.push('type')
        else LogTypeValidator.validate((childLog.type))

        if (childLog.date === undefined) fields.push('date')
        else DateValidator.validate(childLog.date)

        if (childLog.value === undefined) fields.push('value')
        else NumberValidator.validate(childLog.value, 'value')

        if (!childLog.child_id) fields.push('child_id')
        else ObjectIdValidator.validate(childLog.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
