import { Environment } from '../../src/application/domain/model/environment'
import { Location } from '../../src/application/domain/model/location'
import { Measurement, MeasurementType } from '../../src/application/domain/model/measurement'

export class EnvironmentMock extends Environment {

    constructor() {
        super()
        this.generateEnvironment()
    }

    private generateEnvironment(): void {
        super.id = this.generateObjectId()
        super.institution_id = this.generateObjectId()
        super.timestamp = new Date()
        super.climatized = (Math.random() >= 0.5)
        super.measurements = this.generateMeasurements()
        super.location = new Location().fromJSON({
            local: 'Indoor',
            room: 'room 01',
            latitude: Math.random() * 90,
            longitude:  Math.random() * 180
        })
    }

    private generateMeasurements(): Array<Measurement> {
        const measurements: Array<Measurement> = []

        for (let i = 0; i < 3; i++) {
            switch (Math.floor((Math.random() * 5))) { // 0-4
                case 0:
                    measurements.push(this.generateHumi())
                    break
                case 1:
                    measurements.push(this.generatePm1())
                    break
                case 2:
                    measurements.push(this.generatePm2_5())
                    break
                case 3:
                    measurements.push(this.generatePm10())
                    break
                default:
                    measurements.push(this.generateTemp())
                    break
            }
        }

        return measurements
    }

    private generateTemp(): Measurement {
        const measurement: Measurement = new Measurement()
        measurement.type = MeasurementType.TEMPERATURE
        measurement.timestamp = new Date()
        measurement.value = Math.random() * 13 + 19 // 19-31
        measurement.unit = '°C'
        measurement.child_id = this.generateObjectId()

        return measurement
    }

    private generateHumi(): Measurement {
        const measurement: Measurement = new Measurement()
        measurement.type = MeasurementType.HUMIDITY
        measurement.timestamp = new Date()
        measurement.value = Math.random() * 16 + 30 // 30-45
        measurement.unit = '%'
        measurement.child_id = this.generateObjectId()

        return measurement
    }

    private generatePm1(): Measurement {
        const measurement: Measurement = new Measurement()
        measurement.type = MeasurementType.PM1
        measurement.timestamp = new Date()
        measurement.value = Math.random() // 0-1
        measurement.unit = 'µm'
        measurement.child_id = this.generateObjectId()

        return measurement
    }

    private generatePm2_5(): Measurement {
        const measurement: Measurement = new Measurement()
        measurement.type = MeasurementType.PM2_5
        measurement.timestamp = new Date()
        measurement.value = Math.random() * 2.6 // 0-2.5
        measurement.unit = 'µm'
        measurement.child_id = this.generateObjectId()

        return measurement
    }

    private generatePm10(): Measurement {
        const measurement: Measurement = new Measurement()
        measurement.type = MeasurementType.PM10
        measurement.timestamp = new Date()
        measurement.value = Math.random() * 11 // 0-10
        measurement.unit = 'µm'
        measurement.child_id = this.generateObjectId()

        return measurement
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
