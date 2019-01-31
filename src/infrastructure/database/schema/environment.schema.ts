import Mongoose from 'mongoose'

interface IEnvironmentModel extends Mongoose.Document {
}

const environmentSchema = new Mongoose.Schema({
        institution_id: {
            type: Mongoose.Schema.Types.ObjectId,
            required: true
        },
        location: {
            local: {
                type: String,
                required: true
            },
            room: {
                type: String,
                required: true
            },
            latitude: { type: Number },
            longitude: { type: Number }
        },
        measurements: {
            type: {
                type: String,
                required: true
            },
            value: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                required: true
            }
        },
        climatized: { type: Boolean },
        timestamp: {
            type: Date,
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

environmentSchema.index({ location: 1, timestamp: 1 }, { unique: true }) // define index at schema level
export const EnvironmentRepoModel = Mongoose.model<IEnvironmentModel>('Environment', environmentSchema)
