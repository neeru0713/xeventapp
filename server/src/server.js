import dotenv from 'dotenv'

import app from './app.js'
import connectDatabase from './config/db.js'
import seedAdminUser from './utils/seedAdminUser.js'

dotenv.config()

const port = Number(process.env.PORT) || 5000

const startServer = async () => {
  try {
    await connectDatabase()
    await seedAdminUser()

    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
