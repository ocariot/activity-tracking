import Mongoose from 'mongoose'

interface IMeasurementModel extends Mongoose.Document {
}

const measurementSchema = new Mongoose.Schema({
        type: {
            type: String,
        },
        timestamp: {
            type: Date,
        },
        value: {
            type: Number
        },
        unit: {
            type: String,
        },
        child_id: {
            type: Mongoose.Schema.Types.ObjectId,
        },
        fat: {
            type: Number
        },
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
measurementSchema.index({ timestamp: 1, child_id: 1 }, { unique: true }) // define index at schema level
export const MeasurementRepoModel = Mongoose.model<IMeasurementModel>('Measurement', measurementSchema)
