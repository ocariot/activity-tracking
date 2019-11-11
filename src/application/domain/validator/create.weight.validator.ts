import { ValidationException } from '../exception/validation.exception'
import { Weight } from '../model/weight'
import { CreateMeasurementValidator } from './create.measurement.validator'
import { NumberValidator } from './number.validator'

export class CreateWeightValidator {
    public static validate(weight: Weight): void | ValidationException {
        CreateMeasurementValidator.validate(weight)

        if (weight.body_fat) NumberValidator.validate(weight.body_fat.value!, 'body_fat')
    }
}
