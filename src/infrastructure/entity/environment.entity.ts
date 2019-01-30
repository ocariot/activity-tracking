export class EnvironmentEntity {
    public id?: string
    public institution_id?: string // Id of institution associated with a environment.
    public location?: any // Sensor Location
    public measurements?: Array<any> // Associated Measurements
    public climatized?: boolean // Boolean variable to identify if a environment is climatized.
}
