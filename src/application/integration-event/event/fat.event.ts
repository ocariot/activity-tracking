import { EventType, IntegrationEvent } from './integration.event'
import { Fat } from '../../domain/model/fat'

export class FatEvent extends IntegrationEvent<Fat> {
    constructor(public event_name: string, public timestamp?: Date, public fat?: Fat) {
        super(event_name, EventType.FAT, timestamp)
    }

    public toJSON(): any {
        if (!this.fat) return {}
        return {
            ...super.toJSON(),
            ...{ fat: this.fat.toJSON() }
        }
    }
}
