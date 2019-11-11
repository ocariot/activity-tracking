import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * Implementation of the entity location.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Location>}
 */
export class Location implements IJSONSerializable, IJSONDeserializable<Location> {
    private _local!: string // Local where device is installed.
    private _room!: string // Room where device is installed.
    private _latitude?: string // Latitude from place's geolocation.
    private _longitude?: string // Longitude from place's geolocation.

    constructor(local?: string, room?: string, latitude?: string, longitude?: string) {
        if (local) this.local = local
        if (room) this.room = room
        if (latitude) this.latitude = latitude
        if (longitude) this.longitude = longitude
    }

    get local(): string {
        return this._local
    }

    set local(value: string) {
        this._local = value
    }

    get room(): string {
        return this._room
    }

    set room(value: string) {
        this._room = value
    }

    get latitude(): string | undefined {
        return this._latitude
    }

    set latitude(value: string | undefined) {
        this._latitude = value
    }

    get longitude(): string | undefined {
        return this._longitude
    }

    set longitude(value: string | undefined) {
        this._longitude = value
    }

    public fromJSON(json: any): Location {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.local !== undefined) this.local = json.local
        if (json.room !== undefined) this.room = json.room
        if (json.latitude !== undefined) {
            if (typeof json.latitude === 'number') json.latitude = json.latitude.toString()
            this.latitude = json.latitude
        }
        if (json.longitude !== undefined) {
            if (typeof json.longitude === 'number') json.longitude = json.longitude.toString()
            this.longitude = json.longitude
        }

        return this
    }

    public toJSON(): any {
        return {
            local: this.local,
            room: this.room,
            latitude: this.latitude,
            longitude: this.longitude
        }
    }
}
