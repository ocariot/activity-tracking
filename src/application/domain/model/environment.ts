import { Entity } from './entity'
import { Location } from './location'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { DatetimeValidator } from '../validator/datetime.validator'
import { Temperature } from './temperature'
import { Humidity } from './humidity'

/**
 * Entity implementation for environment measurements.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<Environment>}
 */
export class Environment extends Entity implements IJSONSerializable, IJSONDeserializable<Environment> {
    private _institution_id?: string // Id of institution associated with a environment.
    private _location?: Location // Sensor Location
    private _temperature?: Temperature // Temperature measurement associated with a environment.
    private _humidity?: Humidity // Humidity measurement associated with a environment.
    private _climatized?: boolean // Boolean variable to identify if a environment is climatized.
    private _timestamp!: Date // Timestamp according to the UTC.

    constructor() {
        super()
    }

    get institution_id(): string | undefined {
        return this._institution_id
    }

    set institution_id(value: string | undefined) {
        this._institution_id = value
    }

    get location(): Location | undefined {
        return this._location
    }

    set location(value: Location | undefined) {
        this._location = value
    }

    get temperature(): Temperature | undefined {
        return this._temperature
    }

    set temperature(value: Temperature | undefined) {
        this._temperature = value
    }

    get humidity(): Humidity | undefined {
        return this._humidity
    }

    set humidity(value: Humidity | undefined) {
        this._humidity = value
    }

    get climatized(): boolean | undefined {
        return this._climatized
    }

    set climatized(value: boolean | undefined) {
        this._climatized = value !== undefined ? value : false
    }

    get timestamp(): Date {
        return this._timestamp
    }

    set timestamp(value: Date) {
        this._timestamp = value
    }

    public convertDatetimeString(value: string): Date {
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): Environment {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.institution_id !== undefined) this.institution_id = json.institution_id
        if (json.location !== undefined) this.location = new Location().fromJSON(json.location)
        if (json.temperature !== undefined) this.temperature = new Temperature().fromJSON(json.temperature)
        if (json.humidity !== undefined) this.humidity = new Humidity().fromJSON(json.humidity)
        this.climatized = json.climatized
        if (json.timestamp !== undefined) this.timestamp = this.convertDatetimeString(json.timestamp)

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            institution_id: this.institution_id,
            location: this.location ? this.location.toJSON() : this.location,
            temperature: this.temperature ? {
                value: this.temperature.value,
                unit: this.temperature.unit
            } : this.temperature,
            humidity: this.humidity ? {
                value: this.humidity.value,
                unit: this.humidity.unit
            } : this.humidity,
            climatized: this.climatized,
            timestamp: this.timestamp
        }
    }
}
