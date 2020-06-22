import Mongoose from 'mongoose'

interface IDevice extends Mongoose.Document {
}

const deviceSchema = new Mongoose.Schema({
        name: {
            type: String
        },
        address: {
            type: String,
            unique: true,
            sparse: true
        },
        type: {
            type: String
        },
        model_number: {
            type: String
        },
        manufacturer: {
            type: String
        },
        location: {
            local: {
                type: String
            },
            room: {
                type: String
            },
            latitude: { type: String },
            longitude: { type: String }
        },
        institution_id: {
            type: Mongoose.Schema.Types.ObjectId
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

export const DeviceRepoModel = Mongoose.model<IDevice>('Device', deviceSchema)
