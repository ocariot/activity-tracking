import { EventType, IntegrationEvent } from './integration.event'
import { Weight } from '../../domain/model/weight'

export class WeightEvent extends IntegrationEvent<Weight> {
    constructor(public event_name: string, public timestamp?: Date, public weight?: Weight) {
        super(event_name, EventType.WEIGHT, timestamp)
    }

    public toJSON(): any {
        if (!this.weight) return {}
        return {
            ...super.toJSON(),
            ...{ weight: this.weight.toJSON() }
        }
    }
}
