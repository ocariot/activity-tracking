export class PhysicalActivityLogEntity {
    public id?: string
    public steps?: Array<any> // Logs of steps by a child
    public calories?: Array<any> // Logs of calories by a child
    public active_minutes?: Array<any> // Logs of active minutes of a child
}
