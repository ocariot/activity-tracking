import { Temperature } from '../../src/application/domain/model/temperature'

export class TemperatureMock extends Temperature {

    constructor() {
        super()
        this.generateTemperature()
    }

    private generateTemperature(): void {
        super.id = this.generateObjectId()
        super.value = Math.floor((Math.random() * 30))
        super.unit = 'ºC'
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
