import Mongoose from 'mongoose'

interface IActivityModel extends Mongoose.Document {
}

const activitySchema = new Mongoose.Schema({
        name: {
            type: String,
            required: 'Name of activity is required!'
        },
        start_time: {
            type: Date
        },
        end_time: { type: Date },
        duration: {
            type: Number,
            required: 'Duration of activity is required!'
        },
        max_intensity: { type: String },
        max_intensity_duration: { type: Number },
        calories: {
            type: Number
        },
        steps: {
            type: Number,
            required: 'Number of steps taken during the activity is required!'
        },
        levels: [
            {
                name: {
                    type: String,
                    required: 'Name of activity level is required!'
                },
                duration: {
                    type: Number,
                    required: 'Duration of activity level is required!'
                }
            }
        ],
        child: {
            type: Mongoose.Schema.Types.ObjectId,
            required: 'Child required!'
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
                return ret
            }
        }
    }
)
activitySchema.index({ child: 1, start_time: 1 }, { unique: true }) // define index at schema level
export const ActivityRepoModel = Mongoose.model<IActivityModel>('PhysicalActivity', activitySchema)
