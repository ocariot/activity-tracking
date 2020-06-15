import { Device } from '../model/device'
import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { ObjectIdValidator } from './object.id.validator'
import { LocationValidator } from './location.validator'

export class CreateDeviceValidator {
    public static validate(item: Device): void | ValidationException {
        const fields: Array<string> = []

        if (!item.name) fields.push('name')
        if (!item.type) fields.push('type')
        if (!item.location) fields.push('location')
        else LocationValidator.validate(item.location)

        ObjectIdValidator.validate(item.institutionId!, Strings.INSTITUTION.PARAM_ID_NOT_VALID_FORMAT)

        if (fields.length) {
            throw new ValidationException(Strings.ERROR_MESSAGE.REQUIRED_FIELDS,
                'Device validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
