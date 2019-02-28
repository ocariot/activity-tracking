import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { Log } from '../model/log'
import { LogTypeValidator } from './log.type.validator'
import { ObjectIdValidator } from './object.id.validator'

export class CreateLogValidator {
    public static validate(activityLog: Log): void | ValidationException {
        const fields: Array<string> = []

        // validate null and correct attribute types
        if (!activityLog.type) fields.push('type')
        else LogTypeValidator.validate((activityLog.type))
        if (!activityLog.date) fields.push('date')
        if (activityLog.value === undefined) fields.push('value')
        else if (activityLog.value < 0) {
            throw new ValidationException('Value field is invalid...',
                'Physical Activity log validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (!activityLog.child_id) fields.push('child_id')
        else ObjectIdValidator.validate(activityLog.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Physical Activity log validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
