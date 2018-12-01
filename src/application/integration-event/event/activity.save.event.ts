import { Activity } from '../../domain/model/activity'
import { IntegrationEvent } from './integration.event'

export class ActivitySaveEvent extends IntegrationEvent<Activity> {
    constructor(public event_name: string, public timestamp?: Date, public activity?: Activity) {
        super(event_name, timestamp)
    }

    public serialize(): any {
        if (!this.activity) return {}
        return {
            event_name: this.event_name,
            timestamp: this.timestamp,
            activity: this.activity.serialize()
        }
    }
}
