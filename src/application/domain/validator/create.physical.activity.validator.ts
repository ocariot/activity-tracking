import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { PhysicalActivityLevelsValidator } from './physical.activity.levels.validator'
import { UuidValidator } from './uuid.validator'
import { Strings } from '../../../utils/strings'

export class CreatePhysicalActivityValidator {
    public static validate(activity: PhysicalActivity): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!activity.start_time) fields.push('start_time')
        if (!activity.end_time) fields.push('end_time')
        if (!activity.name) fields.push('name')
        if (activity.calories === undefined) fields.push('calories')
        else if (activity.calories < 0) {
            throw new ValidationException('Calories field is invalid...',
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (activity.duration === undefined) fields.push('duration')
        else if (activity.duration < 0) {
            throw new ValidationException('Duration field is invalid...',
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (activity.steps !== undefined && activity.steps < 0) {
            throw new ValidationException('Steps field is invalid...',
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (!activity.child_id) fields.push('child_id')
        else UuidValidator.validate(activity.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        if (activity.levels && activity.levels.length > 0) PhysicalActivityLevelsValidator.validate(activity.levels)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Physical Activity validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
