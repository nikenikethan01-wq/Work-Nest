import validator from 'validator'
import bcrypt from 'bcryptjs'
import pool from '../db/db.js'

export async function registerUser(req, res) {
  const data = req.body

  // CHECK IF ALL FIELD EXISTS
  // TRIM WHITE SPACES EXCEPT FOR "PASSWORD"
  for (let [key, value] of Object.entries(data)) {
    if (!value) {
      return res
        .status(400)
        .json({ error: `'${key}' value is invalid or empty.` })
    }
    if (typeof value === 'string' && key !== 'password') {
      data[key] = value.trim()
    }
  }

  // EMAIL TO LOWER CASE
  data.email = data.email.toLowerCase()
  data.role = data.role.toLowerCase()

  // DESTRUCTURING
  const {
    name,
    email,
    password,
    role,
    company,
    clientLocation,
    description,
    professionalTitle,
    skills,
    experience,
    hourlyRate,
    bio,
    freelancerLocation,
  } = data

  const hashedPassword = await bcrypt.hash(password, 10)

  // VALIDATE EMAIL
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email.' })
  }

  // CHECK IF EMAIL ALREADY EXISTS
  const userExists = await pool.query(
    `
          SELECT
              email
          FROM users
          WHERE email = $1
      `,
    [email],
  )
  if (userExists.rows[0]) {
    return res.status(400).json({
      error:
        'Account with this email already exists, Please enter another email.',
    })
  }

  // VALIDATE ROLE
  if (!['client', 'freelancer'].includes(role)) {
    return res.status(400).json({ Error: 'Invalid role selected.' })
  }

  // CREATE NEW POOL CONNECTION
  const client = await pool.connect()
  try {
    // BEGIN TRANSACTION
    await client.query('BEGIN')

    // INSERT INTO USERS
    const result = await client.query(
      `
            INSERT INTO users(email, password_hash, role, name)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `,
      [email, hashedPassword, role, name],
    )
    const userId = result.rows[0].id

    // INSERT INTO CLIENT_PROFILES
    if (role === 'client') {
      await client.query(
        `
                INSERT INTO client_profiles(user_id, company, location, description)
                VALUES ($1, $2, $3, $4)
            `,
        [userId, company, clientLocation, description],
      )
    }
    //  INSERT INTO FREELANCERS_PROLES
    else if (role === 'freelancer') {
      await client.query(
        `
                INSERT INTO freelancer_profiles(user_id, professional_title, skills, experience, hourly_rate, bio, location)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
        [
          userId,
          professionalTitle,
          skills,
          experience,
          hourlyRate,
          bio,
          freelancerLocation,
        ],
      )
    }
    // COMMIT TRANSACTION
    await client.query('COMMIT')
    // CREATE SESSION
    req.session.userId = userId

    return res.status(201).json({ message: 'Registration sucessfull.' })
  } catch (err) {
    // ROLLBACK TRANSACTION
    await client.query('ROLLBACK')
    console.log(`error : `, err.message)
    return res
      .status(500)
      .json({ error: 'Internal server error. Please try later.' })
  } finally {
    client.release()
  }
}

export async function login(req, res) {
  let { email, password } = req.body

  // REMOVE WHITESPACES
  email = email.trim()

  // VALIDATE EMAIL
  if (!validator.isEmail(email)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  // QUERY DB FOR USER
  try {
    const result = await pool.query(
      `
          SELECT
            *
          FROM users
          WHERE email = $1
      `,
      [email],
    )

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Email is not registered.' })
    }
    const passwordHash = result.rows[0].password_hash
    const validPassword = await bcrypt.compare(password, passwordHash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    // CREATE SESSION
    req.session.userId = result.rows[0].id
    return res.status(200).json({ role: result.rows[0].role })
  } catch (err) {
    console.log(`Error : ${err.message}`)
    return res
      .status(500)
      .json({ error: 'Internal server error. Please try later.' })
  }
}

export async function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ Error: 'Failed to logout' })
    }
    // EXPLICTLY TELLING THE BROWSER TO
    // CLEAR COOKIE
    res.clearCookie('connect.sid')
    return res.sendStatus(204)
  })
}

export async function me(req, res) {
  const userId = req.session.userId

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized, please login.',
    })
  }

  try {
    const result = await pool.query(
      `
        SELECT
          id,
          email,
          role,
          name
        FROM users
        WHERE id = $1
      `,
      [userId],
    )

    if (!result.rows[0]) {
      return res.status(401).json({
        error: 'Unauthorized, please login',
      })
    }

    return res.status(200).json(result.rows[0])
  } catch (err) {
    console.log({ Error: err.message })
    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}
