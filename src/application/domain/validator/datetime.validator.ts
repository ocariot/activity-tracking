import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class DatetimeValidator {
    public static validate(datetime: string): void | ValidationException {
        // validate ISO 8601
        if (!(/^\d{4}-(0[1-9]|1[0-2])-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i).test(datetime)) {
            throw new ValidationException(`Datetime: ${datetime}`.concat(Strings.ERROR_MESSAGE.INVALID_DATE),
                Strings.ERROR_MESSAGE.INVALID_DATE_DESC)
        }
    }
}
