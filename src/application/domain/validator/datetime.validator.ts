import { ValidationException } from '../exception/validation.exception'

export class DatetimeValidator {
    public static validate(datetime: string): void | ValidationException {
        // validate ISO 8601
        if (!(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i).test(datetime)) {
            throw new ValidationException(`Datetime: ${datetime}, is not in valid ISO 8601 format.`,
                'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ')
        }
    }

    public static validateDateLog(dateStart: string, dateEnd: string): void | ValidationException {
        // validate ISO 8601
        if (!(/^\d{4}-\d\d-\d\d$/i).test(dateStart)) {
            throw new ValidationException(`date_start: ${dateStart}, is not in valid ISO 8601 format.`,
                'Date must be in the format: yyyy-MM-dd')
        }
        if (!(/^\d{4}-\d\d-\d\d$/i).test(dateEnd)) {
            throw new ValidationException(`date_end: ${dateEnd}, is not in valid ISO 8601 format.`,
                'Date must be in the format: yyyy-MM-dd')
        }
    }
}
