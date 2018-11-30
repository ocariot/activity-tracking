export class EnvironmentEntity {
    private id?: string
    private timestamp?: Date
    private temperature?: number
    private humidity?: number
    private location?: any
    private created_at?: Date

    public getId(): string | undefined {
        return this.id
    }

    public setId(value: string | undefined) {
        this.id = value
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

    public getLocation(): any {
        return this.location
    }

    public setLocation(location: any) {
        this.location = location
    }

    public getCreatedAt(): Date | undefined {
        return this.created_at
    }

    public setCreatedAt(value: Date | undefined) {
        this.created_at = value
    }
}
