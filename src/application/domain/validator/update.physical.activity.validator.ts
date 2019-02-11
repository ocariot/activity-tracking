import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { PhysicalActivityLevelsValidator } from './physical.activity.levels.validator'
import { UuidValidator } from './uuid.validator'
import { Strings } from '../../../utils/strings'

export class UpdatePhysicalActivityValidator {
    public static validate(physicalActivity: PhysicalActivity): void | ValidationException {
        if (physicalActivity.child_id) {
            UuidValidator.validate(physicalActivity.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
        }

        if (physicalActivity.id) {
            UuidValidator.validate(physicalActivity.id, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
        }

        if (physicalActivity.levels && physicalActivity.levels.length) {
            PhysicalActivityLevelsValidator.validate(physicalActivity.levels)
        }
    }
}
