import { IntegrationEvent } from './integration.event'
import { Environment } from '../../domain/model/environment'

export class EnvironmentSaveEvent extends IntegrationEvent {
    constructor(public event_name: string, public timestamp?: Date, public environment?: Environment) {
        super(event_name, timestamp)
    }
}
