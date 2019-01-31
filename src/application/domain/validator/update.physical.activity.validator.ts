import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { PhysicalActivityLevelsValidator } from './physical.activity.levels.validator'

export class UpdatePhysicalActivityValidator {
    public static validate(activity: PhysicalActivity): void | ValidationException {
        // validate null
        if (activity.levels && activity.levels.length) PhysicalActivityLevelsValidator.validate(activity.levels)
    }
}
