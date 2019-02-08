import { PhysicalActivity } from '../../domain/model/physical.activity'
import { EventType, IntegrationEvent } from './integration.event'

export class PhysicalActivitySaveEvent extends IntegrationEvent<PhysicalActivity> {
    constructor(public event_name: string, public timestamp?: Date,
                public physicalactivity?: PhysicalActivity) {
        super(event_name, EventType.PHYSICAL_ACTIVITIES, timestamp)
    }

    public toJSON(): any {
        if (!this.physicalactivity) return {}
        return {
            event_name: this.event_name,
            timestamp: this.timestamp,
            physicalactivity: this.physicalactivity.toJSON()
        }
    }
}
