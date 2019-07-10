import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivityHeartRate } from '../model/physical.activity.heart.rate'
import { HeartRateZoneValidator } from './heart.rate.zone.validator'
import { Strings } from '../../../utils/strings'

export class PhysicalActivityHeartRateValidator {
    public static validate(heartRate: PhysicalActivityHeartRate): void | ValidationException {
        const fields: Array<string> = []

        if (heartRate.average === undefined) fields.push('average')
        else if (heartRate.average < 0) {
            throw new ValidationException('Average field is invalid...',
                'PhysicalActivityHeartRate validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (!heartRate.out_of_range_zone) fields.push('out_of_range_zone')
        else HeartRateZoneValidator.validate(heartRate.out_of_range_zone)
        if (!heartRate.fat_burn_zone) fields.push('fat_burn_zone')
        else HeartRateZoneValidator.validate(heartRate.fat_burn_zone)
        if (!heartRate.cardio_zone) fields.push('cardio_zone')
        else HeartRateZoneValidator.validate(heartRate.cardio_zone)
        if (!heartRate.peak_zone) fields.push('peak_zone')
        else HeartRateZoneValidator.validate(heartRate.peak_zone)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'PhysicalActivityHeartRate validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
