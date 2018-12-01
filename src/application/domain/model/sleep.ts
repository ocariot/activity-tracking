import { Entity } from './entity'
import { ISerializable } from '../utils/serializable.interface'
import { User } from './user'
import { SleepPattern } from './sleep.pattern'

/**
 * Implementation of the sleep entity.
 *
 * @extends {Entity}
 * @implements {ISerializable<User>}
 */
export class Sleep extends Entity implements ISerializable<Sleep> {
    private start_time?: Date // Sleep start time according to the UTC.
    private end_time?: Date // Sleep end time according to the UTC.
    private duration?: number // Total time in milliseconds spent in all sleep levels.
    private pattern?: SleepPattern // Sleep pattern tracking.
    private user!: User // User belonging to sleep.

    constructor(start_time?: Date, end_time?: Date, duration?: number, levels?: SleepPattern, user?: User, id?: string) {
        super(id)
        this.setStartTime(start_time)
        this.setEndTime(end_time)
        this.setDuration(duration)
        this.setPattern(levels)
        this.setUser(user)
    }

    public getStartTime(): Date | undefined {
        return this.start_time
    }

    public setStartTime(start_time: Date | undefined): void {
        this.start_time = start_time
    }

    public getEndTime(): Date | undefined {
        return this.end_time
    }

    public setEndTime(end_time: Date | undefined): void {
        this.end_time = end_time
    }

    public getDuration(): number | undefined {
        return this.duration
    }

    public setDuration(duration: number | undefined): void {
        this.duration = duration
    }

    public getPattern(): SleepPattern | undefined {
        return this.pattern
    }

    public setPattern(pattern: SleepPattern | undefined): void {
        this.pattern = pattern
    }

    public getUser(): User {
        return this.user
    }

    public setUser(value: User | undefined) {
        if (value) this.user = value
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            id: super.getId(),
            start_time: this.start_time ? this.start_time.toISOString() : this.start_time,
            end_time: this.end_time ? this.end_time.toISOString() : this.end_time,
            duration: this.duration,
            pattern: this.pattern ? this.pattern.serialize() : this.pattern,
            user: this.user ? this.user.serialize() : this.user
        }
    }

    /**
     * Transform JSON into Sleep object.
     *
     * @param json
     */
    public deserialize(json: any): Sleep {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.id !== undefined) super.setId(json.id)
        if (json.start_time !== undefined) this.setStartTime(new Date(json.start_time))
        if (json.end_time !== undefined) this.setEndTime(new Date(json.end_time))
        if (json.duration !== undefined) this.setDuration(json.duration)
        if (json.pattern !== undefined) this.setPattern(new SleepPattern().deserialize(json.pattern))
        if (json.user !== undefined) this.setUser(new User().deserialize(json.user))

        return this
    }
}
