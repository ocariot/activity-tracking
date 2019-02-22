import Mongoose from 'mongoose'

interface IPhysicalActivityLogModel extends Mongoose.Document {
}

const physicalActivityLogSchema = new Mongoose.Schema({
        steps: [
            {
                date: {
                    type: Date,
                    required: true
                },
                value: {
                    type: Number,
                    required: true
                }
            }
        ],
        calories: [
            {
                date: {
                    type: Date,
                    required: true
                },
                value: {
                    type: Number,
                    required: true
                }
            }
        ]
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
