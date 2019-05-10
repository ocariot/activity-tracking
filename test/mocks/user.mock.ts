import { User } from '../../src/application/domain/model/user'

export class UserMock extends User {

    constructor() {
        super()
        this.generateUser()
    }

    private generateUser(): void {
        super.id = this.generateObjectId()
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }
}
