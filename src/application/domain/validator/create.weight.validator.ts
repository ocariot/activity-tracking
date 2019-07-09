import { ValidationException } from '../exception/validation.exception'
import { Weight } from '../model/weight'
import { CreateMeasurementValidator } from './create.measurement.validator'
import { CreateBodyFatValidator } from './create.body.fat.validator'

export class CreateWeightValidator {
    public static validate(weight: Weight): void | ValidationException {
        CreateMeasurementValidator.validate(weight)

        if (weight.body_fat) CreateBodyFatValidator.validate(weight.body_fat)
    }
}
