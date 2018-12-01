import { Entity } from './entity'
import { ISerializable } from '../utils/serializable.interface'
import { Location } from './location'

/**
 * Entity implementation for environment measurements.
 *
 * @extends {Entity}
 * @implements {ISerializable<Environment>}
 */
export class Environment extends Entity implements ISerializable<Environment> {
    private timestamp?: Date // Environment start time according to the UTC.
    private temperature?: number
    private humidity?: number
    private location?: Location

    constructor(timestamp?: Date, temperature?: number, humidity?: number, location?: Location, id?: string) {
        super(id)
        if (timestamp) this.timestamp = timestamp
        if (temperature) this.temperature = temperature
        if (humidity) this.humidity = humidity
        if (location) this.location = location
    }

    public getTimestamp(): Date | undefined {
        return this.timestamp
    }

    public setTimestamp(timestamp: Date | undefined) {
        this.timestamp = timestamp
    }

    public getTemperature(): number | undefined {
        return this.temperature
    }

    public setTemperature(temperature: number | undefined) {
        this.temperature = temperature
    }

    public getHumidity(): number | undefined {
        return this.humidity
    }

    public setHumidity(humidity: number | undefined) {
        this.humidity = humidity
    }

    public getLocation(): Location | undefined {
        return this.location
    }

    public setLocation(location: Location | undefined) {
        this.location = location
    }

    /**
     * Called as default when the object
     * is displayed in console.log()
     */
    public toJSON(): string {
        return this.serialize()
    }

    /**
     * Convert this object to json.
     *
     * @returns {any}
     */
    public serialize(): any {
        return {
            id: this.getId(),
            timestamp: this.timestamp ? this.timestamp.toISOString() : this.timestamp,
            temperature: this.temperature,
            humidity: this.humidity,
            location: this.location ? this.location.serialize() : this.location
        }
    }

    /**
     * Transform JSON into Activity object.
     *
     * @param json
     */
    public deserialize(json: any): Environment {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.id !== undefined) super.setId(json.id)
        if (json.timestamp !== undefined) this.setTimestamp(new Date(json.timestamp))
        if (json.temperature !== undefined) this.setTemperature(json.temperature)
        if (json.humidity !== undefined) this.setHumidity(json.humidity)
        if (json.location !== undefined) this.setLocation(new Location().deserialize(json.location))

        return this
    }
}
