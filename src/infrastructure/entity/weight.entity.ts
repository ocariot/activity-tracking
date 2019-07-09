export class WeightEntity {
    public id?: string
    public type?: string // Type of measurement.
    public timestamp?: Date // Timestamp according to the UTC.
    public value?: number // Value of weight measurement.
    public unit?: string // Unit of weight measurement.
    public child_id?: string // Id of child associated with the weight measurement.
    public body_fat?: string // Object of body_fat measurement associated with the weight measurement.
}
