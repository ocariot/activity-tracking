import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { PhysicalActivityLevelsValidator } from './physical.activity.levels.validator'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'
import { PhysicalActivityHeartRateValidator } from './physical.activity.heart.rate.validator'

export class UpdatePhysicalActivityValidator {
    public static validate(physicalActivity: PhysicalActivity): void | ValidationException {
        if (physicalActivity.child_id) {
            ObjectIdValidator.validate(physicalActivity.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        }

        if (physicalActivity.id) {
            ObjectIdValidator.validate(physicalActivity.id, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
        }

        if (physicalActivity.duration && physicalActivity.duration < 0) {
                throw new ValidationException('Duration field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        } else {
            if (physicalActivity.start_time && physicalActivity.end_time) {
                const durationValidate: number = physicalActivity.end_time.getTime() - physicalActivity.start_time.getTime()
                if (durationValidate < 0) {
                    throw new ValidationException('Date field is invalid...',
                        'Date validation failed: The end_time parameter can not contain a older date than that the start_time parameter!')
                }
                if (physicalActivity.duration !== durationValidate) {
                    throw new ValidationException('Duration field is invalid...',
                        'Duration validation failed: Activity duration value does not match values passed in start_time and end_time ' +
                        'parameters!')
                }
            }
        }

        if (physicalActivity.calories && physicalActivity.calories < 0) {
                throw new ValidationException('Calories field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }

        if (physicalActivity.steps && physicalActivity.steps < 0) {
                throw new ValidationException('Steps field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }

        if (physicalActivity.distance && physicalActivity.distance < 0) {
            throw new ValidationException('Distance field is invalid...',
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }

        if (physicalActivity.levels && physicalActivity.levels.length) {
            PhysicalActivityLevelsValidator.validate(physicalActivity.levels)
        }

        if (physicalActivity.heart_rate) {
            PhysicalActivityHeartRateValidator.validate(physicalActivity.heart_rate)
        }
    }
}
