import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { Weight } from '../model/weight'
import { CreateMeasurementValidator } from './create.measurement.validator'

export class CreateWeightValidator {
    public static validate(weight: Weight): void | ValidationException {
        const fields: Array<string> = []

        CreateMeasurementValidator.validate(weight)

        // validate null.
        if (weight.fat === undefined) fields.push('fat')
        else if (weight.fat < 0) {
            throw new ValidationException('Fat field is invalid...',
                'Weight validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Weight validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
