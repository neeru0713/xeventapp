import express from 'express'

import { getCurrentUser, googleAuth, login, signup } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/register', signup)
router.post('/login', login)
router.post('/google', googleAuth)
router.get('/me', protect, getCurrentUser)

export default router
