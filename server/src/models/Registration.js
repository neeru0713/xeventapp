import mongoose from 'mongoose'

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Registered', 'Cancelled'],
      default: 'Registered',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

registrationSchema.index({ event: 1, participant: 1 }, { unique: true })

const Registration = mongoose.model('Registration', registrationSchema)

export default Registration
