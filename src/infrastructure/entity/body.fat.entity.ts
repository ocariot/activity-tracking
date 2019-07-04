export class BodyFatEntity {
    public id?: string
    public type?: string // Type of measurement.
    public timestamp?: Date // Timestamp according to the UTC.
    public value?: number // Value of body body_fat measurement.
    public unit?: string // Unit of body body_fat measurement.
    public child_id?: string // Id of child associated with the body body_fat measurement.
}
