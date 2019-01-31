import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { PhysicalActivityLevelsValidator } from './physical.activity.levels.validator'

export class CreatePhysicalActivityValidator {
    public static validate(activity: PhysicalActivity): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!activity.start_time) fields.push('start_time')
        if (!activity.end_time) fields.push('end_time')
        if (!activity.name) fields.push('name')
        if (activity.calories === undefined) fields.push('calories')
        if (activity.duration === undefined) fields.push('duration')
        if (!activity.child_id) fields.push('child_id')
        if (activity.levels) PhysicalActivityLevelsValidator.validate(activity.levels)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Physical Activity validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
