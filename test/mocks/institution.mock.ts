import { Institution } from '../../src/application/domain/model/institution'

export class InstitutionMock extends Institution {

    constructor() {
        super()
        this.generateInstitution()
    }

    private generateInstitution(): void {
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
