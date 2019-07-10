import Mongoose from 'mongoose'

interface IPhysicalActivityModel extends Mongoose.Document {
}

const physicalActivitySchema = new Mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        start_time: {
            type: Date,
            required: true
        },
        end_time: {
            type: Date,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        calories: {
            type: Number,
            required: true
        },
        steps: {
            type: Number
        },
        levels: [
            {
                name: {
                    type: String,
                    required: true
                },
                duration: {
                    type: Number,
                    required: true
                }
            }
        ],
        heart_rate: {
            average: {
                type: Number
            },
            out_of_range_zone: {
                min: {
                    type: Number
                },
                max: {
                    type: Number
                },
                duration: {
                    type: Number
                }
            },
            fat_burn_zone: {
                min: {
                    type: Number
                },
                max: {
                    type: Number
                },
                duration: {
                    type: Number
                }
            },
            cardio_zone: {
                min: {
                    type: Number
                },
                max: {
                    type: Number
                },
                duration: {
                    type: Number
                }
            },
            peak_zone: {
                min: {
                    type: Number
                },
                max: {
                    type: Number
                },
                duration: {
                    type: Number
                }
            }
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
physicalActivitySchema.index({ child_id: 1, start_time: 1 }, { unique: true }) // define index at schema level
export const ActivityRepoModel = Mongoose.model<IPhysicalActivityModel>('PhysicalActivities', physicalActivitySchema)
