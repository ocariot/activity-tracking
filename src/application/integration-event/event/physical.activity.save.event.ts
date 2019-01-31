import { PhysicalActivity } from '../../domain/model/physical.activity'
import { IntegrationEvent } from './integration.event'

export class PhysicalActivitySaveEvent extends IntegrationEvent<PhysicalActivity> {
    constructor(public event_name: string, public timestamp?: Date, public physicalActivity?: PhysicalActivity) {
        super(event_name, timestamp)
    }

    public toJSON(): any {
        if (!this.physicalActivity) return {}
        return {
            event_name: this.event_name,
            timestamp: this.timestamp,
            physicalactivity: this.physicalActivity.toJSON()
        }
    }
}
