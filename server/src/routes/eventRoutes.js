import express from 'express'

import {
  approveEvent,
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
  updateEventStatus,
} from '../controllers/eventController.js'
import { authorize, protect } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.get('/', getEvents)
router.get('/:id', getEventById)
router.post('/', protect, upload.single('image'), createEvent)
router.put('/:id', protect, upload.single('image'), updateEvent)
router.patch('/:id', protect, upload.single('image'), updateEvent)
router.patch('/:id/status', protect, updateEventStatus)
router.patch('/:id/approval', protect, authorize('Admin'), approveEvent)
router.delete('/:id', protect, deleteEvent)

export default router
