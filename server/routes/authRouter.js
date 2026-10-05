import express from 'express'
import {
  registerUser,
  login,
  logout,
  me,
} from '../controller/authController.js'
import { registerRateLimit, loginRateLimit } from '../middleware/middleware.js'

const authRouter = express.Router()

authRouter.post('/register', registerRateLimit, registerUser)
authRouter.post('/login', loginRateLimit, login)
authRouter.post('/logout', logout)
authRouter.get('/me', me)

export default authRouter
