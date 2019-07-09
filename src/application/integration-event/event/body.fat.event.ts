import { EventType, IntegrationEvent } from './integration.event'
import { BodyFat } from '../../domain/model/body.fat'

export class BodyFatEvent extends IntegrationEvent<BodyFat> {
    constructor(public event_name: string, public timestamp?: Date, public body_fat?: BodyFat) {
        super(event_name, EventType.BODY_FAT, timestamp)
    }

    public toJSON(): any {
        if (!this.body_fat) return {}
        return {
            ...super.toJSON(),
            ...{ body_fat: this.body_fat.toJSON() }
        }
    }
}
