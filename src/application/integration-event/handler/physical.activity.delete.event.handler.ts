// TODO Transform into function and register subscribe in task

// export class PhysicalActivityDeleteEventHandler implements IIntegrationEventHandler<PhysicalActivityEvent> {
//     private count: number = 0
//
//     /**
//      * Creates an instance of PhysicalActivityDeleteEventHandler.
//      *
//      * @param _activityRepository
//      * @param _logger
//      */
//     constructor(
//         @inject(Identifier.ACTIVITY_REPOSITORY) private readonly _activityRepository: IPhysicalActivityRepository,
//         @inject(Identifier.LOGGER) private readonly _logger: ILogger
//     ) {
//     }
//
//     public async handle(event: PhysicalActivityEvent): Promise<void> {
//         try {
//             // 1. Convert json physical activity to object.
//             const activity: PhysicalActivity = new PhysicalActivity().fromJSON(event.physicalactivity)
//
//             // 2. Validate id's
//             ObjectIdValidator.validate(activity.child_id, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
//             ObjectIdValidator.validate(activity.id!, Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
//
//             // 3. Try to remove the physical activity.
//             await this._activityRepository.removeByChild(activity.id!, activity.child_id)
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
