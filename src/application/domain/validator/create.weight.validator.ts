import { ValidationException } from '../exception/validation.exception'
import { Weight } from '../model/weight'
import { CreateMeasurementValidator } from './create.measurement.validator'
import { NumberPositiveValidator } from './number.positive.validator'

export class CreateWeightValidator {
    public static validate(weight: Weight): void | ValidationException {
        CreateMeasurementValidator.validate(weight)

        if (weight.body_fat) NumberPositiveValidator.validate(weight.body_fat.value!, 'body_fat')
    }
}
