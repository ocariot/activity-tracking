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
        pattern: [{
            start_time: {
                type: Date,
                required: 'Start time of sleep pattern is required!'
            },
            name: {
                type: String,
                required: 'Name of sleep pattern is required!'
            },
            duration: {
                type: Number,
                required: 'Duration of sleep pattern is required!'
            }
        }],
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

sleepSchema.index({ child: 1, start_time: 1 }, { unique: true }) // define index at schema level
export const SleepRepoModel = Mongoose.model<ISleepModel>('Sleep', sleepSchema)
