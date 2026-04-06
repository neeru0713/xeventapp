import { OAuth2Client } from 'google-auth-library'

import User from '../models/User.js'
import addActivity from '../utils/activityLogger.js'
import generateToken from '../utils/generateToken.js'
import asyncHandler from '../middleware/asyncHandler.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  picture: user.picture,
  avatar: user.picture,
  role: user.role,
  organizerRequestStatus: user.organizerRequestStatus,
  authProvider: user.authProvider,
  activityLog: user.activityLog,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'Participant', picture = '', avatar = '' } = req.body

  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required')
    error.statusCode = 400
    throw error
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() })

  if (existingUser) {
    const error = new Error('User already exists')
    error.statusCode = 409
    throw error
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    picture: picture || avatar,
  })

  await addActivity(user, 'Signup', 'Created account with email and password')

  res.status(201).json({
    success: true,
    message: 'Signup successful',
    token: generateToken(user._id),
    user: sanitizeUser(user),
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    const error = new Error('Email and password are required')
    error.statusCode = 400
    throw error
  }

  const user = await User.findOne({ email: email.toLowerCase() })

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  await addActivity(user, 'Login', 'Logged in with email and password')

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    user: sanitizeUser(user),
  })
})

export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, role = 'Participant' } = req.body

  if (!idToken || !process.env.GOOGLE_CLIENT_ID) {
    const error = new Error('Google OAuth is not configured')
    error.statusCode = 400
    throw error
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()

  if (!payload?.email) {
    const error = new Error('Unable to verify Google account')
    error.statusCode = 401
    throw error
  }

  let user = await User.findOne({ email: payload.email.toLowerCase() })

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email.toLowerCase(),
      picture: payload.picture || '',
      role,
      authProvider: 'google',
    })
  } else {
    user.picture = payload.picture || user.picture
    user.authProvider = 'google'
    await user.save()
  }

  await addActivity(user, 'Google Login', 'Logged in with Google OAuth')

  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    token: generateToken(user._id),
    user: sanitizeUser(user),
  })
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')

  res.status(200).json({
    success: true,
    user,
  })
})
