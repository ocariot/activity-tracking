// TODO Transform into function and register subscribe in task

// export class BodyFatDeleteEventHandler implements IIntegrationEventHandler<BodyFatEvent> {
//     private count: number = 0
//
//     /**
//      * Creates an instance of BodyFatDeleteEventHandler.
//      *
//      * @param _bodyFatRepository
//      * @param _logger
//      */
//     constructor(
//         @inject(Identifier.BODY_FAT_REPOSITORY) private readonly _bodyFatRepository: IBodyFatRepository,
//         @inject(Identifier.LOGGER) private readonly _logger: ILogger
//     ) {
//     }
//
//     public async handle(event: BodyFatEvent): Promise<void> {
//         try {
//             // 1. Convert json body_fat to object.
//             const body_fat: BodyFat = new BodyFat().fromJSON(event.body_fat)
//
//             // 2. Validate id's
//             ObjectIdValidator.validate(body_fat.child_id!, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
//             ObjectIdValidator.validate(body_fat.id!, Strings.BODY_FAT.PARAM_ID_NOT_VALID_FORMAT)
//
//             // 3. Try to remove the body_fat.
//             await this._bodyFatRepository.removeByChild(body_fat.id!, body_fat.child_id!, body_fat.type!)
//
//             // 4. If got here, it's because the action was successful.
//             this._logger.info(`Action for event ${event.event_name} successfully held! TOTAL: ${++this.count}`)
//         } catch (err) {
//             this._logger.warn(`An error occurred while attempting `
//                 .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
//                 .concat(err.description ? ' ' + err.description : ''))
//         }
//     }
// }
