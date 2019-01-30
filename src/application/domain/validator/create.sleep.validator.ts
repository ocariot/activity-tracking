import { ValidationException } from '../exception/validation.exception'
import { Sleep } from '../model/sleep'

export class CreateSleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!sleep.start_time) fields.push('start_time')
        if (!sleep.end_time) fields.push('end_time')
        if (!sleep.duration) fields.push('duration')
        if (!sleep.child_id) fields.push('child_id')

        const pattern = sleep.pattern
        if (!pattern) {
            fields.push('Pattern')
        } else {
            if (!pattern.data_set || !pattern.data_set.length) fields.push('Data set')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Sleep validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
