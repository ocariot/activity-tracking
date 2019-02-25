import { EventType, IntegrationEvent } from './integration.event'
import { Environment } from '../../domain/model/environment'

export class EnvironmentSaveEvent extends IntegrationEvent<Environment> {
    constructor(public event_name: string, public timestamp?: Date, public environment?: Environment) {
        super(event_name, EventType.ENVIRONMENTS, timestamp)
    }

    public toJSON(): any {
        if (!this.environment) return {}

        return {
            ...super.toJSON(),
            ...{ environment: this.environment.toJSON() }
        }
    }
}
