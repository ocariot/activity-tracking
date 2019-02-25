import Mongoose from 'mongoose'

interface IPhysicalActivityLogModel extends Mongoose.Document {
}

const physicalActivityLogSchema = new Mongoose.Schema({
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
export const ActivityLogRepoModel = Mongoose.model<IPhysicalActivityLogModel>('PhysicalActivityLog', physicalActivityLogSchema)
