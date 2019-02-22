import { Environment } from '../../src/application/domain/model/environment'
import { Location } from '../../src/application/domain/model/location'
import { Measurement, MeasurementType } from '../../src/application/domain/model/measurement'

export class EnvironmentMock extends Environment {

    constructor() {
        super()
        super.fromJSON(JSON.stringify(this.generateEnvironment()))
    }

    private generateEnvironment(): Environment {
        const environment: Environment = new Environment()
        environment.id = this.generateObjectId()
        environment.institution_id = `5c6dd16ea1a67d0034e6108b`
        environment.timestamp = new Date()
        environment.climatized = (Math.random() >= 0.5)
        environment.measurements = this.generateMeasurements()
        environment.location = new Location().fromJSON({
            local: 'Indoor',
            room: 'Bloco H sala 01',
            latitude: -7.2100766,
            longitude: -35.9175756
        })

        return environment
    }

    private generateMeasurements(): Array<Measurement> {
        const measurements: Array<Measurement> = []
        measurements.push(this.generateTemp())
        measurements.push(this.generateHumi())

        return measurements
    }

    private generateTemp(): Measurement {
        const measurement: Measurement = new Measurement()
        measurement.type = MeasurementType.TEMPERATURE
        measurement.value = Math.random() * 13 + 19 // 19-31
        measurement.unit = '°C'

        return measurement
    }

    private generateHumi(): Measurement {
        const measurement: Measurement = new Measurement()
        measurement.type = MeasurementType.HUMIDITY
        measurement.value = Math.random() * 16 + 30 // 30-45
        measurement.unit = '%'

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
