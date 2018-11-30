import { Entity } from './entity'
import { User } from './user'
import { ISerializable } from '../utils/serializable.interface'
import { ActivityLevel } from './activity.level'

/**
 * Implementation of the activity entity.
 *
 * @extends {Entity}
 * @implements {ISerializable<Activity>}
 */
export class Activity extends Entity implements ISerializable<Activity> {
    private name?: string // Name of activity, for example: Walk, Run, swim...
    private start_time?: Date // Activity start time according to the UTC.
    private end_time?: Date // Activity end time according to the UTC.
    private duration?: number // Total time in milliseconds spent in the activity.
    private calories?: number // Calories spent during activity.
    private steps?: number // Number of steps taken during the activity.
    private levels?: Array<ActivityLevel> // Activity levels (sedentary, light, fair or very).
    private user!: User // User belonging to activity.

    constructor(name?: string, start_time?: Date, end_time?: Date, duration?: number, calories?: number,
                steps?: number, levels?: Array<ActivityLevel>, user?: User, id?: string) {
        super(id)
        this.name = name
        this.start_time = start_time
        this.end_time = end_time
        this.duration = duration
        this.calories = calories
        this.steps = steps
        this.levels = levels
        this.setUser(user)
    }

    public getName(): string | undefined {
        return this.name
    }

    public setName(value: string | undefined) {
        this.name = value
    }

    public getStartTime(): Date | undefined {
        return this.start_time
    }

    public setStartTime(value: Date | undefined) {
        this.start_time = value
    }

    public getEndTime(): Date | undefined {
        return this.end_time
    }

    public setEndTime(value: Date | undefined) {
        this.end_time = value
    }

    public getDuration(): number | undefined {
        return this.duration
    }

    public setDuration(value: number | undefined) {
        this.duration = value
    }

    public getCalories(): number | undefined {
        return this.calories
    }

    public setCalories(value: number | undefined) {
        this.calories = value
    }

    public getSteps(): number | undefined {
        return this.steps
    }

    public setSteps(value: number | undefined) {
        this.steps = value
    }

    public getLevels(): Array<ActivityLevel> | undefined {
        return this.levels
    }

    public setLevels(levels: Array<ActivityLevel> | undefined) {
        this.levels = levels
    }

    public getUser(): User {
        return this.user
    }

    public setUser(value: User | undefined) {
        if (value) this.user = value
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
            name: this.name,
            start_time: this.start_time ? this.start_time.toISOString() : undefined,
            end_time: this.end_time ? this.end_time.toISOString() : undefined,
            duration: this.duration,
            calories: this.calories,
            steps: this.steps,
            levels: this.levels,
            user: this.user ? this.user.serialize() : undefined
        }
    }

    /**
     * Transform JSON into Activity object.
     *
     * @param json
     */
    public deserialize(json: any): Activity {
        if (!json) return this
        if (typeof json === 'string') json = JSON.parse(json)

        if (json.id) super.setId(json.id)
        if (json.name) this.setName(json.name)
        if (json.start_time) this.setStartTime(new Date(json.start_time))
        if (json.end_time) this.setEndTime(new Date(json.end_time))
        if (json.duration !== undefined) this.setDuration(json.duration)
        if (json.calories !== undefined) this.setCalories(json.calories)
        if (json.steps !== undefined) this.setSteps(json.steps)
        if (json.levels) this.setLevels(json.levels.map(item => new ActivityLevel().deserialize(item)))
        if (json.user) this.setUser(new User().deserialize(json.user))

        return this
    }
}
