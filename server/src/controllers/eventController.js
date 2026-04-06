import Event from '../models/Event.js'
import Registration from '../models/Registration.js'
import asyncHandler from '../middleware/asyncHandler.js'
import uploadImage from '../utils/uploadImage.js'

const canManageEvent = (user, event) =>
  user.role === 'Admin' || event.organizer.toString() === user._id.toString()

const normalizeEventType = (eventType = '') => {
  const lower = String(eventType).toLowerCase()
  return lower === 'online' ? 'online' : 'offline'
}

const formatLegacyEvent = (event) => ({
  id: event._id,
  _id: event._id,
  title: event.title,
  description: event.description,
  startDate: event.date,
  startTime: event.time,
  endDate: event.date,
  endTime: event.time,
  location: event.location,
  eventType: event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1),
  category: event.category,
  image: event.imageUrl,
  imageUrl: event.imageUrl,
  status: event.status,
  approvalStatus: event.approvalStatus,
  organizer: typeof event.organizer === 'object' && event.organizer !== null && event.organizer._id ? event.organizer._id : event.organizer,
  participantsCount: event.participantsCount || 0,
})

const buildQuery = (queryParams) => {
  const query = {}

  if (queryParams.q) {
    query.$or = [
      { title: { $regex: queryParams.q, $options: 'i' } },
      { description: { $regex: queryParams.q, $options: 'i' } },
      { location: { $regex: queryParams.q, $options: 'i' } },
      { category: { $regex: queryParams.q, $options: 'i' } },
    ]
  }

  if (queryParams.type) {
    query.eventType = queryParams.type
  }

  if (queryParams.location) {
    query.location = { $regex: queryParams.location, $options: 'i' }
  }

  if (queryParams.category) {
    query.category = { $regex: queryParams.category, $options: 'i' }
  }

  if (queryParams.status) {
    query.status = queryParams.status
  }

  if (queryParams.approvalStatus) {
    query.approvalStatus = queryParams.approvalStatus
  }

  if (queryParams.date) {
    const start = new Date(queryParams.date)
    const end = new Date(queryParams.date)
    end.setHours(23, 59, 59, 999)
    query.date = { $gte: start, $lte: end }
  }

  return query
}

export const createEvent = asyncHandler(async (req, res) => {
  if (!['Admin', 'Organizer'].includes(req.user.role)) {
    const error = new Error('Only admins or organizers can create events')
    error.statusCode = 403
    throw error
  }

  const {
    title,
    description,
    date,
    time,
    startDate,
    startTime,
    location,
    eventType,
    category,
    status = 'Upcoming',
    imageUrl,
    image,
  } = req.body

  const normalizedDate = date || startDate
  const normalizedTime = time || startTime
  const normalizedEventType = normalizeEventType(eventType)

  if (!title || !description || !normalizedDate || !normalizedTime || !location || !eventType || !category) {
    const error = new Error('Missing required event fields')
    error.statusCode = 400
    throw error
  }

  const uploadedImageUrl = req.file ? await uploadImage(req.file) : imageUrl || image || ''

  const event = await Event.create({
    title,
    description,
    date: normalizedDate,
    time: normalizedTime,
    location,
    eventType: normalizedEventType,
    category,
    status,
    imageUrl: uploadedImageUrl,
    organizer: req.user._id,
    approvalStatus: req.user.role === 'Admin' ? 'Approved' : 'Pending',
  })

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    event,
    ...formatLegacyEvent(event),
  })
})

export const getEvents = asyncHandler(async (req, res) => {
  const query = buildQuery(req.query)

  if (!req.user || req.user.role !== 'Admin') {
    query.approvalStatus = req.query.approvalStatus || 'Approved'
  }

  const events = await Event.find(query)
    .populate('organizer', 'name email role picture')
    .sort({ date: 1, time: 1 })

  res.status(200).json({
    success: true,
    count: events.length,
    events,
  })
})

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email role picture')

  if (!event) {
    const error = new Error('Event not found')
    error.statusCode = 404
    throw error
  }

  const registrationsCount = await Registration.countDocuments({
    event: event._id,
    status: 'Registered',
  })

  res.status(200).json({
    success: true,
    event: {
      ...event.toObject(),
      participantsCount: registrationsCount,
    },
    ...formatLegacyEvent({
      ...event.toObject(),
      participantsCount: registrationsCount,
    }),
  })
})

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)

  if (!event) {
    const error = new Error('Event not found')
    error.statusCode = 404
    throw error
  }

  if (!canManageEvent(req.user, event)) {
    const error = new Error('You cannot edit this event')
    error.statusCode = 403
    throw error
  }

  const fields = ['title', 'description', 'date', 'time', 'location', 'category', 'status']

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field]
    }
  })

  if (req.body.startDate !== undefined) {
    event.date = req.body.startDate
  }

  if (req.body.startTime !== undefined) {
    event.time = req.body.startTime
  }

  if (req.body.eventType !== undefined) {
    event.eventType = normalizeEventType(req.body.eventType)
  }

  if (req.body.imageUrl || req.body.image) {
    event.imageUrl = req.body.imageUrl || req.body.image
  }

  if (req.file) {
    event.imageUrl = await uploadImage(req.file)
  }

  if (req.user.role === 'Organizer') {
    event.approvalStatus = 'Pending'
  }

  await event.save()

  res.status(200).json({
    success: true,
    message: 'Event updated',
    event,
  })
})

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)

  if (!event) {
    const error = new Error('Event not found')
    error.statusCode = 404
    throw error
  }

  if (!canManageEvent(req.user, event)) {
    const error = new Error('You cannot delete this event')
    error.statusCode = 403
    throw error
  }

  await Registration.deleteMany({ event: event._id })
  await event.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  })
})

export const updateEventStatus = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)

  if (!event) {
    const error = new Error('Event not found')
    error.statusCode = 404
    throw error
  }

  if (!canManageEvent(req.user, event)) {
    const error = new Error('You cannot update this event status')
    error.statusCode = 403
    throw error
  }

  event.status = req.body.status || event.status
  await event.save()

  res.status(200).json({
    success: true,
    message: 'Event status updated successfully',
    event,
  })
})

export const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)

  if (!event) {
    const error = new Error('Event not found')
    error.statusCode = 404
    throw error
  }

  event.approvalStatus = req.body.approvalStatus || 'Approved'
  await event.save()

  res.status(200).json({
    success: true,
    message: 'Event approval updated successfully',
    event,
  })
})
