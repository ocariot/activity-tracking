import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivityHeartRate } from '../model/physical.activity.heart.rate'
import { HeartRateZoneValidator } from './heart.rate.zone.validator'
import { Strings } from '../../../utils/strings'

export class PhysicalActivityHeartRateValidator {
    public static validate(activityHeartRate: PhysicalActivityHeartRate): void | ValidationException {
        const fields: Array<string> = []

        if (activityHeartRate.average === undefined) fields.push('average')
        else if (isNaN(activityHeartRate.average)) {
            throw new ValidationException('Average field is invalid...',
                'PhysicalActivityHeartRate validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
        } else if (activityHeartRate.average < 0) {
            throw new ValidationException('Average field is invalid...',
                'PhysicalActivityHeartRate validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }
        if (!activityHeartRate.out_of_range_zone) fields.push('out_of_range_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.out_of_range_zone)
        if (!activityHeartRate.fat_burn_zone) fields.push('fat_burn_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.fat_burn_zone)
        if (!activityHeartRate.cardio_zone) fields.push('cardio_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.cardio_zone)
        if (!activityHeartRate.peak_zone) fields.push('peak_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.peak_zone)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'PhysicalActivityHeartRate validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
