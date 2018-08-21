import mongoose, { Document } from 'mongoose'
/**
 * Interface Activity
 * 
 * @author Lucas Rocha <lucas.rocha@nutes.uepb.edu.br>
 * @version 1.0
 * @copyright Copyright (c) 2018, NUTES/UEPB. 
 */
export interface IActivity extends Document {
    id?: string
    user_id: string
    name: string
    location?: string
    start_time: Date
    end_time: Date
    duration: number
    intensity_level: string
    distance: number
    calories: number
    heartrate: number
    steps: number
    create_at?: Date
}

/**
 * Schema of Activity.
 */
const activitySchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: 'Id of User is required!'
    },
    name: {
        type: String,
        required: 'Name of activity is required!'
    },
    location: { type: String },
    start_time: {
        type: Date,
        required: "Activity start time is required!"
    },
    end_time: {
        type: Date,
        required: "Activity end time is required!"
    },
    duration: {
        type: Number,
        required: 'Duration of activity is required!'
    },
    intensity_level: {
        type: String,
        required: 'Intensity level of activity is required!'
    },
    distance: {
        type: Number,
        required: 'Distance traveled during activity is required!'
    },
    calories: {
        type: Number,
        required: 'Calories spent during activity is required!'
    },
    heartrate: {
        type: Number,
        required: 'Average heart rate during activity is required!'
    },
    steps: {
        type: Number,
        required: 'Number of steps taken during the activity is required!'
    }
},
    {
        timestamps: { createdAt: 'created_at' }
    }
)

activitySchema.pre('save', (next) => {
    // this will run before saving 
    next()
})

export const Activity = mongoose.model<IActivity>('Activity', activitySchema)