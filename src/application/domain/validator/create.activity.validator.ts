import { ValidationException } from '../exception/validation.exception'
import { Activity } from '../model/activity'
import { Strings } from '../../../utils/strings'
import { ObjectIdValidator } from './object.id.validator'

export class CreateActivityValidator {
    public static validate(activity: Activity): void | ValidationException {
        const fields: Array<string> = []

        // validate null.
        if (!activity.start_time) fields.push('start_time')
        if (!activity.end_time) fields.push('end_time')
        if (activity.duration === undefined) fields.push('duration')
        else if (isNaN(activity.duration)) {
            throw new ValidationException('Duration field is invalid...',
                'Activity validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
        }
        else if (activity.duration < 0) {
            throw new ValidationException('Duration field is invalid...',
                'Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        else {
            if (activity.start_time && activity.end_time) {
                const durationValidate: number = activity.end_time.getTime() - activity.start_time.getTime()
                if (durationValidate < 0) {
                    throw new ValidationException('Date field is invalid...',
                        'Date validation failed: The end_time parameter can not contain an older date than that the start_time parameter!')
                }
                if (Number(activity.duration) !== durationValidate) {
                    throw new ValidationException('Duration field is invalid...',
                        'Duration validation failed: Activity duration value does not match values passed in start_time and end_time ' +
                        'parameters!')
                }
            }
        }
        if (!activity.child_id) fields.push('child_id')
        else ObjectIdValidator.validate(activity.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Activity validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
