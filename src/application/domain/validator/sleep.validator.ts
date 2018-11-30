import { ValidationException } from '../exception/validation.exception'
import { Sleep } from '../model/sleep'

export class SleepValidator {
    public static validate(sleep: Sleep): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!sleep.getStartTime()) fields.push('Start time')
        if (!sleep.getEndTime()) fields.push('End time')
        if (!sleep.getDuration()) fields.push('Duration')

        const pattern = sleep.getPattern()
        if (!pattern) {
            fields.push('Pattern')
        } else {
            if (!pattern.getDataSet()) fields.push('Data set')
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Sleep validation failed: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
