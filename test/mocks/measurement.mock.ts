import { Measurement, MeasurementType } from '../../src/application/domain/model/measurement'

export class MeasurementMock extends Measurement {

    constructor() {
        super()
        this.generateMeasurement()
    }

    private generateMeasurement(): void {
        super.id = this.generateObjectId()
        super.type = MeasurementType.BODY_FAT
        super.timestamp = new Date()
        super.value = Math.random() * 10 + 20 // 20-29
        super.unit = '%'
        super.child_id = '5a62be07de34500146d9c544'
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
