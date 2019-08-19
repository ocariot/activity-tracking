import { ValidationException } from '../exception/validation.exception'
import { LogType } from '../model/log'

export class LogTypeValidator {
    public static validate(type: string): void | ValidationException {
        const typesLog = Object.values(LogType)

        if (!typesLog.includes(type)) {
            throw new ValidationException(`The name of type provided "${type}" is not supported...`,
                `The names of the allowed types are: ${typesLog.join(', ')}.`)
        }
    }
}
