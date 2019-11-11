import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { ObjectIdValidator } from './object.id.validator'
import { Strings } from '../../../utils/strings'
import { PhysicalActivityHeartRateValidator } from './physical.activity.heart.rate.validator'
import { StringValidator } from './string.validator'
import { NumberValidator } from './number.validator'

export class UpdatePhysicalActivityValidator {
    public static validate(physicalActivity: PhysicalActivity): void | ValidationException {
        if (physicalActivity.child_id) {
            ObjectIdValidator.validate(physicalActivity.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        }

        if (physicalActivity.id) {
            ObjectIdValidator.validate(physicalActivity.id, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
        }

        if (physicalActivity.start_time) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE, Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC)
        }

        if (physicalActivity.end_time) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE, Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC)
        }

        if (physicalActivity.duration) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE, Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC)
        }

        if (physicalActivity.name !== undefined) StringValidator.validate(physicalActivity.name, 'name')

        if (physicalActivity.calories !== undefined) NumberValidator.validate(physicalActivity.calories, 'calories')

        if (physicalActivity.steps !== undefined) NumberValidator.validate(physicalActivity.steps, 'steps')

        if (physicalActivity.distance !== undefined) NumberValidator.validate(physicalActivity.distance, 'distance')

        if (physicalActivity.levels && physicalActivity.levels.length) {
            throw new ValidationException(Strings.ERROR_MESSAGE.UNABLE_UPDATE, Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC)
        }

        if (physicalActivity.heart_rate) PhysicalActivityHeartRateValidator.validate(physicalActivity.heart_rate)
    }
}
