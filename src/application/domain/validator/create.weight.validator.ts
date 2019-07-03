import { ValidationException } from '../exception/validation.exception'
import { Weight } from '../model/weight'
import { CreateMeasurementValidator } from './create.measurement.validator'
import { CreateFatValidator } from './create.fat.validator'

export class CreateWeightValidator {
    public static validate(weight: Weight): void | ValidationException {
        CreateMeasurementValidator.validate(weight)

        if (weight.fat) CreateFatValidator.validate(weight.fat)
    }
}
