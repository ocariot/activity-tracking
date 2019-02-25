import { EventType, IntegrationEvent } from './integration.event'
import { Sleep } from '../../domain/model/sleep'

export class SleepSaveEvent extends IntegrationEvent<Sleep> {
    constructor(public event_name: string, public timestamp?: Date, public sleep?: Sleep) {
        super(event_name, EventType.SLEEP, timestamp)
    }

    public toJSON(): any {
        if (!this.sleep) return {}
        return {
            ...super.toJSON(),
            ...{ sleep: this.sleep.toJSON() }
        }
    }
}
