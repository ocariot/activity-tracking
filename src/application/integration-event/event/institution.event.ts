import { EventType, IntegrationEvent } from './integration.event'
import { Institution } from '../../domain/model/institution'

export class InstitutionEvent extends IntegrationEvent<Institution> {
    constructor(public event_name: string, public timestamp?: Date, public institution?: Institution) {
        super(event_name, EventType.INSTITUTIONS, timestamp)
    }

    public toJSON(): any {
        if (!this.institution) return {}
        return {
            ...super.toJSON(),
            ...{ institution: this.institution.toJSON() }
        }
    }
}
