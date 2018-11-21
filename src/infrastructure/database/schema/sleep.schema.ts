import Mongoose from 'mongoose'

interface ISleepModel extends Mongoose.Document {
}

const sleepSchema = new Mongoose.Schema({
        start_time: {
            type: Date,
            required: 'Sleep start time is required!'
        },
        end_time: {
            type: Date,
            required: 'Sleep end time is required!'
        },
        duration: {
            type: Number,
            required: 'Duration of sleep is required!'
        },
        levels: [{
            start_time: {
                type: Date,
                required: 'Start time of sleep level is required!'
            },
            name: {
                type: String,
                required: 'Name of sleep level is required!'
            },
            duration: {
                type: Number,
                required: 'Duration of sleep level is required!'
            }
        }],
        user: {
            type: Mongoose.Schema.Types.ObjectId,
            required: 'User required!'
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
                delete ret.updatedAt
                delete ret.end_time
                return ret
            }
        }
    }
)

sleepSchema.index({ user: 1, start_time: 1 }, { unique: true }) // define index at schema level
export const SleepRepoModel = Mongoose.model<ISleepModel>('Sleep', sleepSchema)
