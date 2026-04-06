import express from 'express'

import {
  approveOrganizerRequest,
  deleteUser,
  getActivityLog,
  getAllUsers,
  getDashboardStats,
  getOrganizerRequests,
  getProfile,
  requestOrganizerRole,
  updateProfile,
  updateUserRole,
} from '../controllers/userController.js'
import { authorize, protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.put('/request-organizer', protect, requestOrganizerRole)
router.get('/activity', protect, getActivityLog)
router.get('/dashboard/stats', protect, authorize('Admin'), getDashboardStats)
router.get('/', protect, authorize('Admin'), getAllUsers)
router.get('/admin/organizer-requests', protect, authorize('Admin'), getOrganizerRequests)
router.put('/admin/users/:id/approve-organizer', protect, authorize('Admin'), approveOrganizerRequest)
router.patch('/:id/role', protect, authorize('Admin'), updateUserRole)
router.delete('/:id', protect, authorize('Admin'), deleteUser)

export default router
