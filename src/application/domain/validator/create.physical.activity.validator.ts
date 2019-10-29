import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivity } from '../model/physical.activity'
import { PhysicalActivityLevelsValidator } from './physical.activity.levels.validator'
import { Strings } from '../../../utils/strings'
import { CreateActivityValidator } from './create.activity.validator'
import { PhysicalActivityHeartRateValidator } from './physical.activity.heart.rate.validator'
import { StringValidator } from './string.validator'
import { NumberValidator } from './number.validator'

export class CreatePhysicalActivityValidator {
    public static validate(activity: PhysicalActivity): void | ValidationException {
        const fields: Array<string> = []

        try {
            CreateActivityValidator.validate(activity)
        } catch (err) {
            if (err.message !== 'REQUIRED_FIELDS') throw err
            fields.push(err.description.split(','))
        }

        if (activity.name === undefined) fields.push('name')
        else StringValidator.validate(activity.name, 'name')

        if (activity.calories === undefined) fields.push('calories')
        else NumberValidator.validate(activity.calories, 'calories')

        if (activity.steps) {
            NumberValidator.validate(activity.steps, 'steps')
        }

        if (activity.distance) {
            NumberValidator.validate(activity.distance, 'distance')
        }

        if (activity.levels && activity.levels.length > 0) PhysicalActivityLevelsValidator.validate(activity.levels)
        if (activity.heart_rate) PhysicalActivityHeartRateValidator.validate(activity.heart_rate)

        if (fields.length > 0) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                fields.join(', ').concat(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC))
        }
    }
}
