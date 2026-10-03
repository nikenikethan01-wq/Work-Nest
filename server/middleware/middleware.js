import pool from '../db/db.js'
import session from 'express-session'
import pgSession from 'connect-pg-simple'

function requireAuth(req, res, next) {
  const userId = req.session.userId
  if (!userId) {
    return res.status(401).json({ Error: 'Unauthorized' })
  }
  next()
}

async function requireClient(req, res, next) {
  const userId = req.session.userId
  try {
    const result = await pool.query(
      `
            SELECT
               role
            FROM users
            WHERE id = $1 
        `,
      [userId],
    )
    if (!result.rows[0]) {
      return res.status(401).json({
        Error: 'Unauthorized',
      })
    }
    if (result.rows[0].role !== 'client') {
      return res
        .status(403)
        .json({ Error: 'You are not authorized to perform this action.' })
    }
  } catch (err) {
    console.log({ Error: err.message })
    return res.status(500).json({ Error: 'Internal server error.' })
  }
  next()
}

async function requireFreelancer(req, res, next) {
  const userId = req.session.userId
  try {
    const result = await pool.query(
      `
            SELECT
               role
            FROM users
            WHERE id = $1 
        `,
      [userId],
    )
    if (!result.rows[0]) {
      return res.status(401).json({
        Error: 'Unauthorized',
      })
    }
    if (result.rows[0].role !== 'freelancer') {
      return res
        .status(401)
        .json({ Error: 'You are not authorized to perform this action.' })
    }
  } catch (err) {
    console.log({ Error: err.message })
    return res.status(500).json({ Error: 'Internal server error.' })
  }
  next()
}

const sessionMiddleware = () => {
  const PostgreSQLStore = pgSession(session)
  return session({
    store: new PostgreSQLStore({
      pool: pool,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
}

const socketAuthorization = (socket, next) => {
  const session = socket.request.session

  if (!session || !session.userId) {
    return next(new Error('Unauthorized'))
  }
  socket.userId = socket.request.session.userId
  next()
}

const verifyConversationParticipant = async (req, res, next) => {
  const { conversationId } = req.params
  const currentUser = req.session.userId

  try {
    const isParticipant = await pool.query(
      `
          SELECT
            id
          FROM conversations
          WHERE id = $1
          AND (client_id = $2 OR freelancer_id = $2)
      
      `,
      [conversationId, currentUser],
    )
    if (isParticipant.rowCount !== 0) next()
    else next(new Error('Unauthorized'))
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Server error.',
    })
  }
}

export {
  requireAuth,
  requireClient,
  requireFreelancer,
  sessionMiddleware,
  socketAuthorization,
  verifyConversationParticipant,
}
