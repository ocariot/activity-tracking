export class FatEntity {
    public id?: string
    public type?: string // Type of measurement.
    public timestamp?: Date // Timestamp according to the UTC.
    public value?: number // Value of body fat measurement.
    public unit?: string // Unit of body fat measurement.
    public child_id?: string // Id of child associated with the body fat measurement.
}
