import Mongoose from 'mongoose'

interface ILogModel extends Mongoose.Document {
}

const logSchema = new Mongoose.Schema({
        type: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        child_id: {
            type: Mongoose.Schema.Types.ObjectId,
            required: true
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
logSchema.index({ child_id: 1, type: 1, date: 1 }, { unique: true }) // define index at schema level
export const LogRepoModel = Mongoose.model<ILogModel>('Log', logSchema)
