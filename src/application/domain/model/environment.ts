import { Entity } from './entity'
import { Location } from './location'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { DatetimeValidator } from '../validator/datetime.validator'
import { Measurement } from './measurement'

/**
 * Entity implementation for environment measurements.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<Environment>}
 */
export class Environment extends Entity implements IJSONSerializable, IJSONDeserializable<Environment> {
    private _institution_id?: string // Id of institution associated with a environment.
    private _location?: Location // Sensor Location
    private _measurements?: Array<Measurement> // Associated Measurements
    private _climatized?: boolean // Boolean variable to identify if a environment is climatized.
    private _timestamp!: Date // Timestamp according to the UTC.
    private _isFromEventBus: boolean // Boolean that defines whether the object comes from the event bus or not

    constructor() {
        super()
        this._isFromEventBus = false
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

    get measurements(): Array<Measurement> | undefined {
        return this._measurements
    }

    set measurements(value: Array<Measurement> | undefined) {
        this._measurements = value
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

    get isFromEventBus(): boolean {
        return this._isFromEventBus
    }

    set isFromEventBus(value: boolean) {
        this._isFromEventBus = value
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
        if (json.measurements !== undefined && json.measurements instanceof Array) {
            this.measurements = json.measurements.map(item => new Measurement().fromJSON(item))
        }
        this.climatized = json.climatized
        if (json.timestamp !== undefined && !(json.timestamp instanceof Date)) {
            this.timestamp = this.convertDatetimeString(json.timestamp)
        } else if (json.timestamp !== undefined && json.timestamp instanceof Date){
            this.timestamp = json.timestamp
        }

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            institution_id: this.institution_id,
            location: this.location ? this.location.toJSON() : this.location,
            measurements: this.measurements ? this.measurements.map(item => item.toJSON()) : this.measurements,
            climatized: this.climatized,
            timestamp: this.timestamp
        }
    }
}
