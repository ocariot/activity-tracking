import { ValidationException } from '../exception/validation.exception'
import { Temperature } from '../model/temperature'
import { Humidity } from '../model/humidity'
import { TemperatureValidator } from './temperature.validator'
import { HumidityValidator } from './humidity.validator'

export class MeasurementsValidator {
    public static validate(measurements: Array<Temperature | Humidity>): void | ValidationException {
        const message: string = 'Measurement are not in a format that is supported!'

        if (!measurements.length) {
            throw new ValidationException(message, 'The measurements collection must not be empty!')
        }

        measurements.forEach((measurement: Temperature | Humidity) => {
            if (measurement instanceof Temperature) TemperatureValidator.validate(measurement)
            if (measurement instanceof Humidity) HumidityValidator.validate(measurement)
        })
    }
}
