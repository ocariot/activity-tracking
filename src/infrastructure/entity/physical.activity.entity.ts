import { ActivityEntity } from './activity.entity'

export class PhysicalActivityEntity extends ActivityEntity {
    public name?: string // Name of physical physicalActivity.
    public calories?: number // Calories spent during physical physicalActivity.
    public steps?: number // Number of steps taken during the physical physicalActivity.
    public levels?: Array<any> // PhysicalActivity levels (sedentary, light, fair or very).
}
