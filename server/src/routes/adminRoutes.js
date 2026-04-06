import express from 'express'

import { approveOrganizerRequest, getOrganizerRequests } from '../controllers/userController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/organizer-requests', protect, authorize('Admin'), getOrganizerRequests)
router.put('/users/:id/approve-organizer', protect, authorize('Admin'), approveOrganizerRequest)

export default router
