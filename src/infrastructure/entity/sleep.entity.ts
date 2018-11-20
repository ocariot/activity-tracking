export class SleepEntity {
    private id?: string
    private start_time?: Date // Sleep start time according to the UTC.
    private end_time?: Date // Sleep end time according to the UTC.
    private duration?: number // Total time in milliseconds spent in all sleep levels.
    private levels?: Array<any> // Sleep levels tracking.
    private user?: string // User id.
    private created_at?: Date // Timestamp according to the UTC pattern, automatically generated that resource is saved on server.

    public getId(): string | undefined {
        return this.id
    }

    public setId(value: string | undefined) {
        this.id = value
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

    public getLevels(): Array<any> | undefined {
        return this.levels
    }

    public setLevels(levels: Array<any> | undefined): void {
        this.levels = levels
    }

    public getUser(): string | undefined {
        return this.user
    }

    public setUser(value: string | undefined) {
        if (value) this.user = value
    }

    public getCreatedAt(): Date | undefined {
        return this.created_at
    }

    public setCreatedAt(value: Date | undefined) {
        this.created_at = value
    }
}
