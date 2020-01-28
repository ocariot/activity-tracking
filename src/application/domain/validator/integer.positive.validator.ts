import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class IntegerPositiveValidator {
    public static validate(value: number, fieldName: string): void | ValidationException {
        if (!(/^[0-9]{1,}$/i).test(String(value))) {
            throw new ValidationException(Strings.ERROR_MESSAGE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.NEGATIVE_INTEGER.replace('{0}', fieldName))
        }
    }
}
