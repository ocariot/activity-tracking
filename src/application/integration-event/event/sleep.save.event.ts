import { IntegrationEvent } from './integration.event'
import { Sleep } from '../../domain/model/sleep'

export class SleepSaveEvent extends IntegrationEvent {
    constructor(public event_name: string, public timestamp?: Date, public sleep?: Sleep) {
        super(event_name, timestamp)
    }
}
