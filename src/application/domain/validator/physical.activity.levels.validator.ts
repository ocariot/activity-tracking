import { ValidationException } from '../exception/validation.exception'
import { PhysicalActivityLevel, ActivityLevelType } from '../model/physical.activity.level'
import { Strings } from '../../../utils/strings'

export class PhysicalActivityLevelsValidator {
    public static validate(levels: Array<PhysicalActivityLevel>): void | ValidationException {
        const fields: Array<string> = []
        const message: string = 'Level are not in a format that is supported!'
        const levelsTypes = Object.values(ActivityLevelType)

        if (!levels.length) {
            throw new ValidationException(message, `Must have values ​​for the following levels: ${levelsTypes.join(', ')}.`)
        }

        levels.forEach((level: PhysicalActivityLevel) => {
            // validate null
            if (!level.name) fields.push('level name')
            else if (!levelsTypes.includes(level.name)) {
                throw new ValidationException(`The name of level provided "${level.name}" is not supported...`,
                    `The names of the allowed levels are: ${levelsTypes.join(', ')}.`)
            }
            if (level.duration === undefined) fields.push('level duration')
            else if (level.duration < 0) {
                throw new ValidationException('Some (or several) duration field of levels array is invalid...',
                    'Physical Activity Level validation failed: '.concat(Strings.ERROR_MESSAGE.NEGATIVE_PARAMETER))
            }
        })

        if (levelsTypes.length !== levels.filter(item => levelsTypes.includes(item.name)).length) {
            throw new ValidationException(message, `Must have values ​​for the following levels: ${levelsTypes.join(', ')}.`)
        }

        if (fields.length > 0) {
            throw new ValidationException('Level are not in a format that is supported...',
                `Validation of physical activity levels failed:  ${fields.join(', ')} is required!.`)
        }
    }
}
