import Event from '../models/Event.js'
import Registration from '../models/Registration.js'
import User from '../models/User.js'
import { sendMail } from '../config/mailer.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const registerForEvent = asyncHandler(async (req, res) => {
  if (!['Participant', 'Organizer'].includes(req.user.role)) {
    const error = new Error('Only participants can register for events')
    error.statusCode = 403
    throw error
  }

  const event = await Event.findById(req.params.eventId)

  if (!event || event.approvalStatus !== 'Approved') {
    const error = new Error('Event not available for registration')
    error.statusCode = 404
    throw error
  }

  let registration = await Registration.findOne({
    event: event._id,
    participant: req.user._id,
  })

  if (registration && registration.status === 'Registered') {
    const error = new Error('Already registered for this event')
    error.statusCode = 409
    throw error
  }

  if (registration) {
    registration.status = 'Registered'
    registration.cancellationReason = ''
    await registration.save()
  } else {
    registration = await Registration.create({
      event: event._id,
      participant: req.user._id,
    })
  }

  event.participantsCount = await Registration.countDocuments({
    event: event._id,
    status: 'Registered',
  })
  await event.save()

  res.status(201).json({
    success: true,
    message: 'Registered successfully',
    registration,
  })
})

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({
    event: req.params.eventId,
    participant: req.user._id,
    status: 'Registered',
  }).populate('event')

  if (!registration) {
    const error = new Error('Registration not found')
    error.statusCode = 404
    throw error
  }

  registration.status = 'Cancelled'
  registration.cancellationReason = req.body.reason || ''
  await registration.save()

  const event = await Event.findById(registration.event._id)
  event.participantsCount = await Registration.countDocuments({
    event: event._id,
    status: 'Registered',
  })
  await event.save()

  const organizer = await User.findById(event.organizer)
  await sendMail({
    to: organizer?.email,
    subject: `Registration cancelled for ${event.title}`,
    text: `${req.user.name} cancelled their registration.${registration.cancellationReason ? ` Reason: ${registration.cancellationReason}` : ''}`,
  })

  res.status(200).json({
    success: true,
    message: 'Registration cancelled',
    registration,
  })
})

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ participant: req.user._id })
    .populate('event')
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations,
  })
})
