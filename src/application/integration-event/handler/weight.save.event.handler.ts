import { IWeightRepository } from '../../port/weight.repository.interface'
import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { Weight } from '../../domain/model/weight'
import { ConflictException } from '../../domain/exception/conflict.exception'
import { Strings } from '../../../utils/strings'
import { CreateWeightValidator } from '../../domain/validator/create.weight.validator'
import { ValidationException } from '../../domain/exception/validation.exception'
import { IBodyFatRepository } from '../../port/body.fat.repository.interface'
import { BodyFat } from '../../domain/model/body.fat'

// TODO Reimplement the logic
/**
 * Handler for WeightSaveEvent operation.
 *
 * @param event
 */
export const weightSaveEventHandler = async (event: any) => {
    const bodyFatRepository: IBodyFatRepository = DIContainer.get<IBodyFatRepository>(Identifier.BODY_FAT_REPOSITORY)
    const weightRepository: IWeightRepository = DIContainer.get<IWeightRepository>(Identifier.WEIGHT_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)
    let count: number = 0

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.weight) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        // 1. Convert json weight to object.
        const weight: Weight = new Weight().fromJSON(event.weight)

        // 2. Validate object based on create action.
        CreateWeightValidator.validate(weight)

        // 3. Checks if Weight already exists.
        const weightExist = await weightRepository.checkExist(weight)
        if (weightExist) throw new ConflictException(Strings.WEIGHT.ALREADY_REGISTERED)

        // 4. Create new BodyFat register if does not already exist.
        let bodyFatSaved: BodyFat = new BodyFat()

        if (weight.body_fat) {
            const bodyFat: BodyFat = await bodyFatRepository.selectByChild(weight.body_fat.timestamp!,
                weight.body_fat.child_id!, weight.body_fat.type!)
            bodyFat.value = weight.body_fat.value
            await bodyFatRepository.update(bodyFat)

            if (bodyFat) weight.body_fat = bodyFat
            else {
                bodyFatSaved = await bodyFatRepository.create(weight.body_fat)
                weight.body_fat = bodyFatSaved
            }
        }

        // 5. Create new Weight register.
        await weightRepository.create(weight)

        // 6. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++count}`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
