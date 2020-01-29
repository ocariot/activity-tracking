import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivityHeartRate } from '../model/physical.activity.heart.rate'
import { Strings } from '../../../utils/strings'
import { HeartRateZone } from '../model/heart.rate.zone'
import { IntegerPositiveValidator } from './integer.positive.validator'

export class PhysicalActivityHeartRateValidator {
    public static validate(activityHeartRate: PhysicalActivityHeartRate): void | ValidationException {
        const fields: Array<string> = []

        const invalidFields: Array<string> = []
        const regZone = new RegExp(/^0*[1-9][0-9]*$/i) // 1-n

        if (activityHeartRate.average === undefined) fields.push('heart_rate.average')
        else {
            if (!(regZone.test(String(activityHeartRate.average)))) {
                throw new ValidationException(
                    Strings.ERROR_MESSAGE.INVALID_FIELDS,
                    Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO.replace('{0}', 'heart_rate.average')
                )
            }
        }

        // Validate zones
        const validateZone = (zone: HeartRateZone, heartRateZoneName: string) => {
            if (zone.min === undefined) fields.push(`${heartRateZoneName}.min`)
            else if (!(regZone.test(String(zone.min)))) invalidFields.push(`${heartRateZoneName}.min`)

            if (zone.max === undefined) fields.push(`${heartRateZoneName}.max`)
            else if (!(regZone.test(String(zone.max)))) invalidFields.push(`${heartRateZoneName}.max`)

            if (zone.duration === undefined) fields.push(`${heartRateZoneName}.duration`)
            else IntegerPositiveValidator.validate(zone.duration, `${heartRateZoneName}.duration`)
        }

        if (!activityHeartRate.out_of_range_zone) fields.push('heart_rate.out_of_range_zone')
        else validateZone(activityHeartRate.out_of_range_zone, 'heart_rate.out_of_range_zone')

        if (!activityHeartRate.fat_burn_zone) fields.push('heart_rate.fat_burn_zone')
        else validateZone(activityHeartRate.fat_burn_zone, 'heart_rate.fat_burn_zone')

        if (!activityHeartRate.cardio_zone) fields.push('heart_rate.cardio_zone')
        else validateZone(activityHeartRate.cardio_zone, 'heart_rate.cardio_zone')

        if (!activityHeartRate.peak_zone) fields.push('heart_rate.peak_zone')
        else validateZone(activityHeartRate.peak_zone, 'heart_rate.peak_zone')

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', ')))
        }

        if (invalidFields.length) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO.replace('{0}', invalidFields.join(', '))
            )
        }
    }
}
