import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { PhysicalActivityLevelsValidator } from './physical.activity.levels.validator'
import { Strings } from '../../../utils/strings'
import { CreateActivityValidator } from './create.activity.validator'
import { PhysicalActivityHeartRateValidator } from './physical.activity.heart.rate.validator'

export class CreatePhysicalActivityValidator {
    public static validate(activity: PhysicalActivity): void | ValidationException {
        const fields: Array<string> = []

        CreateActivityValidator.validate(activity)
        if (!activity.name) fields.push('name')
        if (activity.calories === undefined) fields.push('calories')
        else if (activity.calories < 0) {
            throw new ValidationException('Calories field is invalid...',
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (activity.steps !== undefined && activity.steps < 0) {
            throw new ValidationException('Steps field is invalid...',
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (activity.distance !== undefined && activity.distance < 0) {
            throw new ValidationException('Distance field is invalid...',
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (activity.levels && activity.levels.length > 0) PhysicalActivityLevelsValidator.validate(activity.levels)
        if (activity.heart_rate) PhysicalActivityHeartRateValidator.validate(activity.heart_rate)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Physical Activity validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
