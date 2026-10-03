import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import authRouter from './routes/authRouter.js'
import clientRouter from './routes/clientRouter.js'
import freelancerRouter from './routes/freelancerRouter.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import {
  sessionMiddleware,
  socketAuthorization,
} from './middleware/middleware.js'
import chatRouter from './routes/chatRouter.js'
import pool from './db/db.js'
import session from 'express-session'

const PORT = process.env.PORT || 3000
const onlineUsers = {}
const app = express()
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
)
app.use(express.json())
app.use(sessionMiddleware())

const httpServer = createServer(app)
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  },
})
io.engine.use(sessionMiddleware())
io.use(socketAuthorization)

io.on('connection', (socket) => {
  socket.join(socket.userId)

  if (Object.hasOwn(onlineUsers, socket.userId)) onlineUsers[socket.userId]++
  else onlineUsers[socket.userId] = 1
  io.emit('online-users', onlineUsers)
  socket.on('send-message', async (data) => {
    try {
      const { conversationId, message } = data
      const senderId = socket.userId
      if (!senderId) {
        socket.emit('authentication-error', 'Unauthorized.')
        return
      }
      // EXISTENCE VALIDATION
      const existenceCheck = await pool.query(
        `
            SELECT
                1
            FROM conversations
            WHERE id = $1
            AND (client_id = $2 OR freelancer_id = $2)
        `,
        [conversationId, senderId],
      )

      if (existenceCheck.rowCount === 0) {
        socket.emit('authentication-error', 'Unauthorized.')
        return
      }

      // MESSAGE VALIDATION
      if (!typeof message === 'string') {
        socket.emit('input-error', 'wrong input type')
        return
      }

      const trimmedMessage = message.trim()

      if (!trimmedMessage) {
        socket.emit('input-error', 'wrong input type')
        return
      }

      //INSERTING DATA
      const insertQuery = await pool.query(
        `
            INSERT INTO messages (
                conversation_id,
                sender_id,
                message
            )
            VALUES ($1, $2, $3)
            RETURNING id, conversation_id, sender_id, message, sent_on ;
        `,
        [conversationId, senderId, trimmedMessage],
      )

      // INSERT DATA WITH USERNAME
      const senderName = await pool.query(
        `
            SELECT
                name
            FROM users
            WHERE id = $1
        `,
        [socket.userId],
      )

      const insertData = {
        ...insertQuery.rows[0],
        ...senderName.rows[0],
      }

      socket.emit('success', insertData)

      // PHASE 2 - SEND IT TO OTHER PERSON.

      const recipientIdQuery = await pool.query(
        `
            SELECT
                client_id,
                freelancer_id
            FROM conversations
            WHERE id = $1
        `,
        [insertQuery.rows[0].conversation_id],
      )

      let recipientId = null

      if (recipientIdQuery.rows[0].client_id === socket.userId)
        recipientId = recipientIdQuery.rows[0].freelancer_id
      else recipientId = recipientIdQuery.rows[0].client_id

      // SENDING MESSAGE TO RECEPITENT SOCKET || ROOM
      socket.to(recipientId).emit('new-message', insertQuery.rows[0])
    } catch (err) {
      console.log(err)
      socket.emit('message-error', 'Failed to send message')
      return
    }
  })
  socket.on('disconnect', () => {
    if (onlineUsers[socket.userId] === 1) delete onlineUsers[socket.userId]
    else onlineUsers[socket.userId]--
    io.emit('online-users', onlineUsers)
  })
})

app.use('/api/auth', authRouter)
app.use('/api/client', clientRouter)
app.use('/api/freelancer', freelancerRouter)
app.use('/api/chat', chatRouter)

//ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    message: err.message,
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
