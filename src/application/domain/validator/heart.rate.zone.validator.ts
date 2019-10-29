import { ValidationException } from '../exception/validation.exception'
import { HeartRateZone } from '../model/heart.rate.zone'
import { Strings } from '../../../utils/strings'
import { NumberValidator } from './number.validator'

export class HeartRateZoneValidator {
    public static validate(heartRateZone: HeartRateZone, heartRateZoneName: string): void | ValidationException {
        const fields: Array<string> = []

        if (heartRateZone.min === undefined) fields.push('heart_rate.'.concat(heartRateZoneName).concat('.min'))
        else NumberValidator.validate(heartRateZone.min, 'heart_rate.'.concat(heartRateZoneName).concat('.min'))

        if (heartRateZone.max === undefined) fields.push('heart_rate.'.concat(heartRateZoneName).concat('.max'))
        else NumberValidator.validate(heartRateZone.max, 'heart_rate.'.concat(heartRateZoneName).concat('.max'))

        if (heartRateZone.duration === undefined) fields.push('heart_rate.'.concat(heartRateZoneName).concat('.duration'))
        else NumberValidator.validate(heartRateZone.duration, 'heart_rate.'.concat(heartRateZoneName).concat('.duration'))

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
