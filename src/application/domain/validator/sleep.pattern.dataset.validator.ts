import { ValidationException } from '../exception/validation.exception'
import { SleepPatternDataSet } from '../model/sleep.pattern.data.set'
import { SleepPatternType } from '../model/sleep.pattern'

export class SleepPatternDataSetValidator {
    public static validate(dataset: SleepPatternDataSet): void | ValidationException {
        const fields: Array<string> = []

        // validate null
        if (!dataset.start_time) fields.push('start_time')
        if (!dataset.name) fields.push('name')
        else if (!Object.values(SleepPatternType).includes(dataset.name)) {
            throw new ValidationException('The sleep pattern name provided is not supported!',
                'The names of the allowed patterns are: '.concat(Object.values(SleepPatternType).join(', '), '.'))
        }
        if (dataset.duration === undefined) fields.push('duration')

        if (fields.length > 0) {
            throw new ValidationException('Dataset are not in a format that is supported!',
                'Validation of the sleep pattern dataset failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
