import Mongoose from 'mongoose'

interface IEnvironmentModel extends Mongoose.Document {
}

const environmentSchema = new Mongoose.Schema({
        timestamp: {
            type: Date,
            required: 'Timestamp of the environment measurement is required!'
        },
        temperature: {
            type: Number,
            required: 'Temperature is required!'
        },
        humidity: {
            type: Number,
            required: 'Humidity is required!'
        },
        location: {
            school: {
                type: String
            },
            room: {
                type: String
            },
            country: {
                type: String
            },
            city: {
                type: String
            }
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
                return ret
            }
        }
    }
)

environmentSchema.index({ location: 1, timestamp: 1 }, { unique: true }) // define index at schema level
export const EnvironmentRepoModel = Mongoose.model<IEnvironmentModel>('Environment', environmentSchema)
