import Event from '../models/Event.js'
import Registration from '../models/Registration.js'
import User from '../models/User.js'
import asyncHandler from '../middleware/asyncHandler.js'
import addActivity from '../utils/activityLogger.js'

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  const registrations = await Registration.find({ participant: req.user._id, status: 'Registered' })
    .populate('event')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    profile: {
      ...user.toObject(),
      registeredEvents: registrations.map((item) => item.event),
    },
  })
})

export const requestOrganizerRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  user.organizerRequestStatus = 'Pending'
  await user.save()
  await addActivity(user, 'Organizer Request', 'Requested organizer role approval')

  res.status(200).json({
    success: true,
    message: 'Organizer request submitted successfully',
  })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  if (req.body.name !== undefined) {
    user.name = req.body.name
  }

  if (req.body.avatar !== undefined) {
    user.picture = req.body.avatar
  }

  if (req.body.picture !== undefined) {
    user.picture = req.body.picture
  }

  await user.save()

  res.status(200).json({
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.picture,
    picture: user.picture,
    role: user.role,
  })
})

export const getActivityLog = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('activityLog')

  res.status(200).json({
    success: true,
    activityLog: user?.activityLog || [],
  })
})

export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  })
})

export const getOrganizerRequests = asyncHandler(async (_req, res) => {
  const users = await User.find({ organizerRequestStatus: 'Pending' }).select('-password').sort({ createdAt: -1 })

  res.status(200).json(
    users.map((user) => ({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.picture,
      picture: user.picture,
      role: user.role,
      organizerRequestStatus: user.organizerRequestStatus,
    })),
  )
})

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  const user = await User.findById(req.params.id)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  user.role = role || user.role
  if (role === 'Organizer') {
    user.organizerRequestStatus = 'Approved'
  } else if (role === 'Participant') {
    user.organizerRequestStatus = 'Rejected'
  }
  await user.save()

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
    },
  })
})

export const approveOrganizerRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  user.role = 'Organizer'
  user.organizerRequestStatus = 'Approved'
  await user.save()

  res.status(200).json({
    success: true,
    message: 'User approved as Organizer',
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.picture,
      picture: user.picture,
      role: user.role,
    },
  })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  await Registration.deleteMany({ participant: user._id })
  await Event.deleteMany({ organizer: user._id })
  await user.deleteOne()

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  })
})

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [eventsCount, registrationsCount, usersCount, pendingEvents] = await Promise.all([
    Event.countDocuments(),
    Registration.countDocuments({ status: 'Registered' }),
    User.countDocuments(),
    Event.countDocuments({ approvalStatus: 'Pending' }),
  ])

  res.status(200).json({
    success: true,
    stats: {
      eventsCount,
      registrationsCount,
      usersCount,
      pendingEvents,
    },
  })
})
