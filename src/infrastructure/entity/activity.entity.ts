export class ActivityEntity {
    public id?: string
    public start_time?: Date // PhysicalActivity start time according to the UTC.
    public end_time?: Date // PhysicalActivity end time according to the UTC.
    public duration?: number // Total time in milliseconds spent in the physicalactivity.
    public child_id?: string // Child ID belonging to physicalactivity.
}
