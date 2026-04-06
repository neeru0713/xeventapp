import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
    },
    picture: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['Admin', 'Organizer', 'Participant'],
      default: 'Participant',
    },
    organizerRequestStatus: {
      type: String,
      enum: ['None', 'Pending', 'Approved', 'Rejected'],
      default: 'None',
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    activityLog: [
      {
        action: { type: String, required: true },
        details: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', async function savePassword(next) {
  if (!this.isModified('password') || !this.password) {
    next()
    return
  }

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  if (!this.password) {
    return false
  }

  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
