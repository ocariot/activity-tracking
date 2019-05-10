import { EventType, IntegrationEvent } from './integration.event'
import { User } from '../../domain/model/user'

export class UserEvent extends IntegrationEvent<User> {
    constructor(public event_name: string, public timestamp?: Date, public user?: User) {
        super(event_name, EventType.USERS, timestamp)
    }

    public toJSON(): any {
        if (!this.user) return {}
        return {
            ...super.toJSON(),
            ...{ user: this.user.toJSON() }
        }
    }
}
