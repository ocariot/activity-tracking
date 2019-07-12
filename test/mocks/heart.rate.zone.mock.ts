import { HeartRateZone } from '../../src/application/domain/model/heart.rate.zone'

export class HeartRateZoneMock extends HeartRateZone {

    constructor() {
        super()
        this.generateHeartRateZone()
    }

    private generateHeartRateZone(): void {
        const heartRateZoneJSON: any = { min: 91, max: 127, duration: 60000 }
        super.fromJSON(heartRateZoneJSON)
    }

}
