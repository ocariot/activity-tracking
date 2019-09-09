import { ValidationException } from '../exception/validation.exception'
import { CreateMeasurementValidator } from './create.measurement.validator'
import { BodyFat } from '../model/body.fat'

export class CreateBodyFatValidator {
    public static validate(body_fat: BodyFat): void | ValidationException {
        CreateMeasurementValidator.validate(body_fat)
    }
}
