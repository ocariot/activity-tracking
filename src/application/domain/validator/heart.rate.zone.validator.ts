import { ValidationException } from '../exception/validation.exception'
import { HeartRateZone } from '../model/heart.rate.zone'
import { Strings } from '../../../utils/strings'

export class HeartRateZoneValidator {
    public static validate(heartRateZone: HeartRateZone): void | ValidationException {
        const fields: Array<string> = []

        if (heartRateZone.min === undefined) fields.push('min')
        else if (isNaN(heartRateZone.min)) {
            throw new ValidationException('Min field is invalid...',
                'HeartRateZone validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
        } else if (heartRateZone.min < 0) {
            throw new ValidationException('Min field is invalid...',
                'HeartRateZone validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }

        if (heartRateZone.max === undefined) fields.push('max')
        else if (isNaN(heartRateZone.max)) {
            throw new ValidationException('Max field is invalid...',
                'HeartRateZone validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
        } else if (heartRateZone.max < 0) {
            throw new ValidationException('Max field is invalid...',
                'HeartRateZone validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }

        if (heartRateZone.duration === undefined) fields.push('duration')
        else if (isNaN(heartRateZone.duration)) {
            throw new ValidationException('Duration field is invalid...',
                'HeartRateZone validation failed: '.concat(Strings.ERROR_MESSAGE.INVALID_NUMBER))
        } else if (heartRateZone.duration < 0) {
            throw new ValidationException('Duration field is invalid...',
                'HeartRateZone validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
        }

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'HeartRateZone validation failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
