import { ActivityEntity } from './activity.entity'

export class PhysicalActivityEntity extends ActivityEntity {
    public name?: string // Name of physical physicalactivity.
    public calories?: number // Calories spent during physical physicalactivity.
    public steps?: number // Number of steps taken during the physical physicalactivity.
    public levels?: Array<any> // PhysicalActivity levels (sedentary, light, fair or very).
    public heart_rate?: any // PhysicalActivity heart rate.
}
