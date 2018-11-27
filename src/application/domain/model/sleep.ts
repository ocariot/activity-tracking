import { Entity } from './entity'
import { ISerializable } from '../utils/serializable.interface'
import { User } from './user'
import { SleepStage } from './sleep.stage'

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
    private stages?: SleepStage // Sleep levels tracking.
    private user!: User // User belonging to sleep.

    constructor(start_time?: Date, end_time?: Date, duration?: number, levels?: SleepStage, user?: User, id?: string) {
        super(id)
        this.setStartTime(start_time)
        this.setEndTime(end_time)
        this.setDuration(duration)
        this.setStages(levels)
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

    public getStages(): SleepStage | undefined {
        return this.stages
    }

    public setStages(levels: SleepStage | undefined): void {
        this.stages = levels
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
            start_time: this.start_time ? this.start_time.toISOString() : undefined,
            end_time: this.end_time ? this.end_time.toISOString() : undefined,
            duration: this.duration,
            levels: this.stages ? this.stages.serialize() : undefined,
            user: this.user ? this.user.serialize() : undefined
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

        if (json.id) super.setId(json.id)
        if (json.start_time) this.setStartTime(new Date(json.start_time))
        if (json.end_time) this.setEndTime(new Date(json.end_time))
        if (json.duration !== undefined) this.setDuration(json.duration)
        if (json.stages) this.setStages(new SleepStage().deserialize(json.stages))
        if (json.user) this.setUser(new User().deserialize(json.user))

        return this
    }
}
