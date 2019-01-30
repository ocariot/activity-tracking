import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'

export class CreatePhysicalActivityValidator {
    public static validate(activity: PhysicalActivity): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!activity.name) fields.push('name')
        if (!activity.calories !== undefined) fields.push('calories')
        if (!activity.start_time) fields.push('start_time')
        if (!activity.end_time) fields.push('end_time')
        if (!activity.duration) fields.push('duration')
        if (!activity.child_id) fields.push('child_id')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'PhysicalActivity validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
