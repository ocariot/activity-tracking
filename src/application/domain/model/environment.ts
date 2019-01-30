import { Entity } from './entity'
import { Location } from './location'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { Measurement } from './measurement'
import { JsonUtils } from '../utils/json.utils'

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
        this._climatized = value
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
        if (json.climatized !== undefined) this.climatized = json.climatized

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            location: this.location ? this.location.toJSON() : this.location,
            measurements: this.measurements ? this.measurements.map(item => item.toJSON()) : this.measurements,
            climatized: this.climatized
        }
    }
}
