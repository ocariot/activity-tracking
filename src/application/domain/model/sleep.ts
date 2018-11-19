import { Entity } from './entity'
import { ISerializable } from '../utils/serializable.interface'
import { User } from './user'
import { SleepLevel } from './sleep.level'

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
    private levels?: SleepLevel // Sleep levels tracking.
    private user!: User // User belonging to activity.
    private created_at?: Date // Timestamp according to the UTC pattern, automatically generated that resource is saved on server.

    constructor(start_time?: Date, end_time?: Date, duration?: number, levels?: SleepLevel, user?: User, id?: string) {
        super(id)
        this.setStartTime(start_time)
        this.setEndTime(end_time)
        this.setDuration(duration)
        this.setLevels(levels)
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

    public getLevels(): SleepLevel | undefined {
        return this.levels
    }

    public setLevels(levels: SleepLevel | undefined): void {
        this.levels = levels
    }

    public getUser(): User {
        return this.user
    }

    public setUser(value: User | undefined) {
        if (value) this.user = value
    }

    public getCreatedAt(): Date | undefined {
        return this.created_at
    }

    public setCreatedAt(value: Date | undefined) {
        this.created_at = value
    }

    /**
     * Convert this object to json.
     *
     * @returns {object}
     */
    public serialize(): any {
        return {
            id: super.getId(),
            start_time: this.start_time ? this.start_time.toISOString() : undefined,
            end_time: this.end_time ? this.end_time.toISOString() : undefined,
            duration: this.duration,
            levels: this.levels ? this.levels.serialize() : undefined,
            user: this.user,
            created_at: this.user ? this.user.serialize() : undefined
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

        if (json.id) this.setId(json.id)
        if (json.start_time) this.setStartTime(new Date(json.start_time))
        if (json.end_time) this.setEndTime(new Date(json.end_time))
        if (json.duration) this.setDuration(json.duration)
        if (json.levels) this.setLevels(json.levels)
        if (json.created_at) this.created_at = new Date(json.created_at)
        if (json.user) this.user = new User().deserialize(json.user)

        return this
    }
}
