import express from 'express'
import {
  requireAuth,
  verifyConversationParticipant,
} from '../middleware/middleware.js'
import {
  getUserConversations,
  getConversationIdBetweenUsers,
  createConversation,
  getConversationDetails,
  getConversationMessages,
} from '../controller/chatController.js'

const chatRouter = express.Router()

chatRouter.get('/conversations', requireAuth, getUserConversations)
chatRouter.get(
  '/conversations/get/:otherUserId',
  requireAuth,
  getConversationIdBetweenUsers,
)

chatRouter.post('/conversations', requireAuth, createConversation)

chatRouter.get(
  '/conversations/:conversationId',
  requireAuth,
  verifyConversationParticipant,
  getConversationDetails,
)

chatRouter.get(
  '/conversations/:conversationId/messages',
  requireAuth,
  verifyConversationParticipant,
  getConversationMessages,
)

export default chatRouter
