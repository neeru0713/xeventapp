import User from '../models/User.js'

const seedAdminUser = async () => {
  const email = 'crio.do.test@example.com'
  const existingAdmin = await User.findOne({ email })

  if (existingAdmin) {
    if (existingAdmin.role !== 'Admin') {
      existingAdmin.role = 'Admin'
      await existingAdmin.save()
    }

    return
  }

  await User.create({
    name: 'Crio Admin',
    email,
    password: '12345678',
    role: 'Admin',
  })

  console.log('Seeded default admin user')
}

export default seedAdminUser
