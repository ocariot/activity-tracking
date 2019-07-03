import { ValidationException } from '../exception/validation.exception'
import { CreateMeasurementValidator } from './create.measurement.validator'
import { Fat } from '../model/fat'

export class CreateFatValidator {
    public static validate(fat: Fat): void | ValidationException {
        CreateMeasurementValidator.validate(fat)
    }
}
