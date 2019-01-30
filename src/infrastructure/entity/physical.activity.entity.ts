import { ActivityEntity } from './activity.entity'

export class PhysicalActivityEntity extends ActivityEntity {
    public name?: string // Name of physical activity.
    public calories?: number // Calories spent during physical activity.
    public steps?: number // Number of steps taken during the physical activity.
    public levels?: Array<any> // PhysicalActivity levels (sedentary, light, fair or very).
}
