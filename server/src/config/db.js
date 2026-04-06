import mongoose from 'mongoose'

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/xevents'

  await mongoose.connect(mongoUri)
  console.log('MongoDB connected')
}

export default connectDatabase
