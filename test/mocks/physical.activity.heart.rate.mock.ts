import { PhysicalActivityHeartRate } from '../../src/application/domain/model/physical.activity.heart.rate'

export class PhysicalActivityHeartRateMock extends PhysicalActivityHeartRate {

    constructor() {
        super()
        this.generateHeartRate()
    }

    private generateHeartRate(): void {
        const activityHeartRateJSON: any = {
            average: Math.floor((Math.random() * 120 + 70)), // 70-189,
            out_of_range_zone: {
                min: 30,
                max: 91,
                duration: 0
            },
            fat_burn_zone: {
                min: 91,
                max: 127,
                duration: 600000
            },
            cardio_zone: {
                min: 127,
                max: 154,
                duration: 0
            },
            peak_zone: {
                min: 154,
                max: 220,
                duration: 0
            },
        }
        super.fromJSON(activityHeartRateJSON)
    }

}
