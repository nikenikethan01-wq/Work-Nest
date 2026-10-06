import pool from '../db/db.js'

export async function getUserConversations(req, res) {
  const userId = req.session.userId

  try {
    const allConversations = await pool.query(
      `
        SELECT
          M.conversation_id,
          M.message,

          CASE
            WHEN U1.id = $1 THEN U2.id
            ELSE U1.id
          END AS other_user_id,

          CASE
            WHEN U1.id = $1 THEN U2.name
            ELSE U1.name
          END AS other_user_name

        FROM messages M

        JOIN conversations C
          ON M.conversation_id = C.id

        JOIN users U1
          ON C.client_id = U1.id

        JOIN users U2
          ON C.freelancer_id = U2.id

        WHERE
          (
            C.client_id = $1
            OR C.freelancer_id = $1
          )

          AND M.id = (
            SELECT M1.id
            FROM messages M1
            WHERE M1.conversation_id = M.conversation_id
            ORDER BY M1.sent_on DESC
            LIMIT 1
          )
      `,
      [userId],
    )

    return res.status(200).json(allConversations.rows)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error.',
    })
  }
}

export async function getConversationIdBetweenUsers(req, res) {
  const { otherUserId } = req.params
  const currentUser = req.session.userId

  try {
    const doesConversationExists = await pool.query(
      `
    SELECT id
    FROM conversations
    WHERE
      (client_id = $1 AND freelancer_id = $2)
      OR
      (client_id = $2 AND freelancer_id = $1)
  `,
      [currentUser, otherUserId],
    )

    if (doesConversationExists.rowCount === 0) {
      return res.status(404).json({
        message: 'Conversation not found',
      })
    }
    return res.status(200).json(doesConversationExists.rows[0])
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error.',
    })
  }
}

export async function createConversation(req, res) {
  const currentUser = req.session.userId
  const { otherUserId } = req.body

  try {
    const doesConversationExists = await pool.query(
      `
            SELECT 
                id
            FROM conversations
            WHERE (client_id = $1 OR client_id = $2)
            AND (freelancer_id = $1 OR freelancer_id = $2)
            
        `,
      [otherUserId, currentUser],
    )

    if (doesConversationExists.rowCount !== 0) {
      return res.status(200).end()
    }

    const findCurrentUserRole = await pool.query(
      `
                SELECT
                    role
                FROM users
                WHERE id = $1
        `,
      [currentUser],
    )
    let client = null
    let freelancer = null

    if (findCurrentUserRole.rows[0].role === 'client') {
      client = currentUser
      freelancer = otherUserId
    } else {
      client = otherUserId
      freelancer = currentUser
    }

    const insertConversation = await pool.query(
      `
            INSERT INTO conversations(client_id, freelancer_id)
            VALUES ($1, $2)
            RETURNING id
        `,
      [client, freelancer],
    )

    return res.status(201).json(insertConversation.rows[0].id)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error.',
    })
  }
}

export async function getConversationDetails(req, res) {
  const { conversationId } = req.params
  try {
    const getDetails = await pool.query(
      `
            SELECT
                C.id,
                U1.id AS client_id,
                U1.name AS client_name,
                U2.id AS freelancer_id,
                U2.name AS freelancer_name,
                C.started_on
            FROM conversations C
            JOIN users U1 ON C.client_id = U1.id
            JOIN users U2 ON C.freelancer_id = U2.id
            WHERE C.id = $1
        `,
      [conversationId],
    )
    return res.status(200).json(getDetails.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Server error.',
    })
  }
}

export async function getConversationMessages(req, res) {
  const { conversationId } = req.params
  try {
    const messages = await pool.query(
      `
          SELECT 
            M.id,
            M.sender_id,
            M.message,
            M.sent_on
          FROM messages M
          WHERE M.conversation_id = $1
          ORDER BY M.sent_on, M.id;
      `,
      [conversationId],
    )
    return res.status(200).json(messages.rows)
  } catch (err) {
    res.status(500).json({
      message: 'Server error.',
    })
  }
}
