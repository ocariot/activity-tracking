import { ValidationException } from '../exception/validation.exception'
import { LogType } from '../model/log'
import { Strings } from '../../../utils/strings'

export class LogTypeValidator {
    public static validate(type: string): void | ValidationException {
        const typesLog: Array<string> = Object.values(LogType)

        if (!typesLog.includes(type)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                `The names of the allowed types are: ${typesLog.join(', ')}.`)
        }
    }
}
