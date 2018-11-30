import { ISerializable } from '../utils/serializable.interface'

/**
 * Implementation of the entity location.
 *
 * @implements {ISerializable<Location>}
 */
export class Location implements ISerializable<Location> {
    private school?: string
    private room?: string
    private country?: string
    private city?: string

    constructor(school?: string, room?: string, country?: string, city?: string) {
        this.school = school
        this.room = room
        this.country = country
        this.city = city
    }

    public getSchool(): string | undefined {
        return this.school
    }

    public setSchool(school: string) {
        this.school = school
    }

    public getRoom(): string | undefined {
        return this.room
    }

    public setRoom(room: string) {
        this.room = room
    }

    public getCountry(): string | undefined {
        return this.country
    }

    public setCountry(country: string) {
        this.country = country
    }

    public getCity(): string | undefined {
        return this.city
    }

    public setCity(city: string) {
        this.city = city
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            school: this.school,
            room: this.room,
            country: this.country,
            city: this.city
        }
    }

    /**
     * Transform JSON into Location object.
     *
     * @param json
     */
    public deserialize(json: any): Location {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.school) this.setSchool(json.school)
        if (json.room) this.setRoom(json.room)
        if (json.country) this.setCountry(json.country)
        if (json.city) this.setCity(json.city)

        return this
    }
}
