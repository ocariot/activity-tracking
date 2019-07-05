import { Weight } from '../../src/application/domain/model/weight'
import { MeasurementType } from '../../src/application/domain/model/measurement'
import { BodyFatMock } from './body.fat.mock'

export class WeightMock extends Weight {

    constructor() {
        super()
        this.generateWeight()
    }

    private generateWeight(): void {
        super.id = this.generateObjectId()
        super.type = MeasurementType.WEIGHT
        super.timestamp = new Date()
        super.value = Math.random() * 16 + 50 // 50-65
        super.unit = 'kg'
        super.child_id = '5a62be07de34500146d9c544'
        super.body_fat = new BodyFatMock()
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
