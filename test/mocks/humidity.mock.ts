import { Humidity } from '../../src/application/domain/model/humidity'

export class HumidityMock extends Humidity {

    constructor() {
        super()
        this.generateHumidity()
    }

    private generateHumidity(): void {
        super.id = this.generateObjectId()
        super.value = Math.floor((Math.random() * 30))
        super.unit = '%'
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
