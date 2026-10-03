import express from 'express'
import {
  registerUser,
  login,
  logout,
  me,
} from '../controller/authController.js'

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/me', me)

export default authRouter
