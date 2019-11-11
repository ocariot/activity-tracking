import { ValidationException } from '../exception/validation.exception'

export class LogDateRangeValidator {
    public static validate(dateStart: string, dateEnd: string): void | ValidationException {
        const rangeDates: number = new Date(dateEnd).getTime() - new Date(dateStart).getTime()
        const period: number = rangeDates / 31970881440     // Should not be longer than 1 year and 5 days

        if (rangeDates < 0) {
            throw new ValidationException('Date range is invalid...',
                'The date_end parameter can not contain an older date than that the date_start parameter!')
        } else if (period > 1) {
            throw new ValidationException('Date range is invalid...',
                'The period between the received dates can not exceed one year!')
        }
    }
}
