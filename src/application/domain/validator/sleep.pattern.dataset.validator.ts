import { ValidationException } from '../exception/validation.exception'
import { SleepPatternDataSet } from '../model/sleep.pattern.data.set'
import { SleepPatternType } from '../model/sleep.pattern'

export class SleepPatternDataSetValidator {
    public static validate(dataset: Array<SleepPatternDataSet>): void | ValidationException {
        const fields: Array<string> = []
        const message: string = 'Dataset are not in a format that is supported!'
        const sleepPatternTypes = Object.values(SleepPatternType)

        if (!dataset.length) {
            throw new ValidationException(message, 'The data_set collection must not be empty!')
        }

        dataset.forEach((data: SleepPatternDataSet) => {
            // validate null
            if (!data.start_time) fields.push('data_set start_time')
            if (!data.name) fields.push('data_set name')
            else if (!sleepPatternTypes.includes(data.name)) {
                throw new ValidationException(`The sleep pattern name provided "${data.name}" is not supported...`,
                    'The names of the allowed patterns are: '.concat(sleepPatternTypes.join(', '), '.'))
            }
            if (data.duration === undefined) fields.push('data_set duration')
        })

        if (fields.length > 0) {
            throw new ValidationException(message,
                'Validation of the sleep pattern dataset failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
