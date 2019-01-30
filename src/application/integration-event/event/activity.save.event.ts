import { PhysicalActivity } from '../../domain/model/physical.activity'
import { IntegrationEvent } from './integration.event'

export class ActivitySaveEvent extends IntegrationEvent<PhysicalActivity> {
    constructor(public event_name: string, public timestamp?: Date, public activity?: PhysicalActivity) {
        super(event_name, timestamp)
    }

    public serialize(): any {
        if (!this.activity) return {}
        return {
            event_name: this.event_name,
            timestamp: this.timestamp,
            activity: this.activity.toJSON()
        }
    }
}
