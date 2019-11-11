import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivityHeartRate } from '../model/physical.activity.heart.rate'
import { HeartRateZoneValidator } from './heart.rate.zone.validator'
import { Strings } from '../../../utils/strings'
import { NumberValidator } from './number.validator'

export class PhysicalActivityHeartRateValidator {
    public static validate(activityHeartRate: PhysicalActivityHeartRate): void | ValidationException {
        const fields: Array<string> = []

        if (activityHeartRate.average === undefined) fields.push('heart_rate.average')
        else NumberValidator.validate(activityHeartRate.average, 'heart_rate.average')

        if (!activityHeartRate.out_of_range_zone) fields.push('heart_rate.out_of_range_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.out_of_range_zone, 'out_of_range_zone')

        if (!activityHeartRate.fat_burn_zone) fields.push('heart_rate.fat_burn_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.fat_burn_zone, 'fat_burn_zone')

        if (!activityHeartRate.cardio_zone) fields.push('heart_rate.cardio_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.cardio_zone, 'cardio_zone')

        if (!activityHeartRate.peak_zone) fields.push('heart_rate.peak_zone')
        else HeartRateZoneValidator.validate(activityHeartRate.peak_zone, 'peak_zone')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
