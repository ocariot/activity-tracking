import { ValidationException } from '../exception/validation.exception'

export class DateValidator {
    public static validate(datetime: string): void | ValidationException {
        // validate datetime
        if (!(/^\d{4}-\d?\d-\d?\d$/i).test(datetime)) {
            throw new ValidationException(`Date parameter: ${datetime}, is not in valid ISO 8601 format.`,
                'Date must be in the format: yyyy-MM-dd')
        }
    }
}
