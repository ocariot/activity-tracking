export class EnvironmentEntity {
    public id?: string
    public institution_id?: string // Id of institution associated with a environment.
    public location?: any // Sensor Location
    public temperature?: any // Temperature measurement associated with a environment.
    public humidity?: any // Humidity measurement associated with a environment.
    public climatized?: boolean // Boolean variable to identify if a environment is climatized.
    public timestamp?: Date // Boolean variable to identify if a environment is climatized.
}
