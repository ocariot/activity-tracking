import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class LogDateValidator {
    public static validate(datetime: string): void | ValidationException {
        // validate datetime
        if (!(/^\d{4}-(0[1-9]|1[0-2])-\d\d$/i).test(datetime)) {
            throw new ValidationException(`Datetime: ${datetime}`.concat(Strings.ERROR_MESSAGE.INVALID_DATE),
                'Date must be in the format: yyyy-MM-dd')
        }
        // Validate day
        const date: Date = new Date(datetime)
        if (isNaN(date.getTime())) {
            throw new ValidationException(`Datetime: ${datetime}`.concat(Strings.ERROR_MESSAGE.INVALID_DATE),
                'Date must be in the format: yyyy-MM-dd')
        }
    }
}
