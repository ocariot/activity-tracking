import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
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

        if (physicalActivity.start_time) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE,
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
        }

        if (physicalActivity.end_time) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE,
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
        }

        if (physicalActivity.duration) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE,
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
        }

        if (physicalActivity.name !== undefined && physicalActivity.name.length === 0) {
            throw new ValidationException('Name field is invalid...',
                'Physical Activity validation failed: Name must have at least one character.')
        }

        if (physicalActivity.calories) {
            if (isNaN(physicalActivity.calories)) {
                throw new ValidationException('Calories field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
            } else if (physicalActivity.calories < 0) {
                throw new ValidationException('Calories field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
            }
        }

        if (physicalActivity.steps) {
            if (isNaN(physicalActivity.steps)) {
                throw new ValidationException('Steps field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
            } else if (physicalActivity.steps < 0) {
                throw new ValidationException('Steps field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
            }
        }

        if (physicalActivity.distance) {
            if (isNaN(physicalActivity.distance)) {
                throw new ValidationException('Distance field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
            } else if (physicalActivity.distance < 0) {
                throw new ValidationException('Distance field is invalid...',
                    'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
            }
        }

        if (physicalActivity.levels && physicalActivity.levels.length) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE,
                'Physical Activity validation failed: '.concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
        }

        if (physicalActivity.heart_rate) PhysicalActivityHeartRateValidator.validate(physicalActivity.heart_rate)
    }
}
