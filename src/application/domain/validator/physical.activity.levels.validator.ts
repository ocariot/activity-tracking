import { ValidationException } from '../exception/validation.exception'
import { ActivityLevel, ActivityLevelType } from '../model/activity.level'

export class PhysicalActivityLevelsValidator {
    public static validate(levels: Array<ActivityLevel>): void | ValidationException {
        const fields: Array<string> = []
        const message: string = 'Level are not in a format that is supported!'
        const levelsTypes = Object.values(ActivityLevelType)

        if (!levels.length) {
            throw new ValidationException(message, 'Must have values ​​for the following levels: '
                .concat(levelsTypes.join(', '), '.'))
        }

        levels.forEach((level: ActivityLevel) => {
            // validate null
            if (level.name && !levelsTypes.includes(level.name)) {
                throw new ValidationException(`The name of level provided "${level.name}" is not supported!`,
                    'The names of the allowed levels are: '.concat(Object.values(ActivityLevelType).join(', '), '.'))
            }
            if (level.duration === undefined) fields.push('duration')
        })

        if (levelsTypes.length !== levels.filter(item => levelsTypes.includes(item.name)).length) {
            throw new ValidationException(message, 'Must have values ​​for the following levels: '
                .concat(levelsTypes.join(', '), '.'))
        }

        if (fields.length > 0) {
            throw new ValidationException('Level are not in a format that is supported!',
                'Validation of physical activity levels failed: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
