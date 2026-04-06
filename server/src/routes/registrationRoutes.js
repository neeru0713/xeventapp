import express from 'express'

import {
  cancelRegistration,
  getMyRegistrations,
  registerForEvent,
} from '../controllers/registrationController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/me', protect, getMyRegistrations)
router.post('/:eventId', protect, registerForEvent)
router.delete('/:eventId', protect, cancelRegistration)

export default router
