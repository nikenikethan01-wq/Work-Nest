import pool from '../db/db.js'

async function getAllJobs(req, res) {
  const { search, category, minBudget, maxBudget, page = 1 } = req.query

  const conditions = []
  const values = []
  const pageNumber = Number(page)

  if (pageNumber <= 0 || !Number.isInteger(pageNumber)) {
    return res.status(400).json({
      Error: 'Invalid page number.',
    })
  }

  // SET LIMIT AND OFFSET FOR PAGINATION
  const limit = 10
  const offset = (pageNumber - 1) * limit

  // FREELANCERS CAN BROWSE LIVE JOBS
  values.push('live')
  conditions.push(`status = $${values.length}`)

  if (search) {
    values.push(`%${search}%`)

    conditions.push(`
      (
        title ILIKE $${values.length}
        OR description ILIKE $${values.length}
      )
    `)
  }

  if (category) {
    values.push(category)
    conditions.push(`category = $${values.length}`)
  }

  if (minBudget) {
    values.push(minBudget)
    conditions.push(`budget >= $${values.length}`)
  }

  if (maxBudget) {
    values.push(maxBudget)
    conditions.push(`budget <= $${values.length}`)
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  try {
    // GET TOTAL JOB COUNT FOR PAGINATION
    const totalJobsResults = await pool.query(
      `
        SELECT COUNT(id)
        FROM jobs
        ${whereClause}
      `,
      values,
    )

    const totalJobs = Number(totalJobsResults.rows[0].count)

    // GET JOBS BASED ON FILTERS
    const jobsResult = await pool.query(
      `
        SELECT
          j.id,
          j.title,
          j.description,
          j.budget,
          j.status,
          j.created_on,
          j.category,
          u.id AS client_id,
          u.name AS client_name
        FROM jobs j
        JOIN users u
          ON j.client_id = u.id
        ${whereClause}
        ORDER BY j.created_on DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      values,
    )

    const data = {
      jobs: jobsResult.rows,
      pagination: {
        page: pageNumber,
        limit,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
      },
    }

    return res.status(200).json(data)
  } catch (err) {
    console.log({ Error: err.message })

    return res.status(500).json({
      Error: 'Internal server error.',
    })
  }
}

async function createApplication(req, res) {
  const { id } = req.params
  const userId = req.session.userId

  // CLEAN INCOMING APPLICATION DATA
  const data = req.body

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      data[key] = value.trim()
    }

    if (value === undefined || value === null || value === '') {
      return res.status(400).json({
        Error: 'Invalid data received.',
      })
    }
  }

  const { proposal, proposedPrice } = req.body

  // CHECK PRICE
  if (!Number.isFinite(proposedPrice) || proposedPrice <= 0) {
    return res.status(400).json({
      Error: 'Invalid data received.',
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // CHECK IF USER IS A FREELANCER
    const userResult = await client.query(
      `
        SELECT role
        FROM users
        WHERE id = $1
      `,
      [userId],
    )

    if (!userResult.rows[0]) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        Error: 'User not found.',
      })
    }

    if (userResult.rows[0].role !== 'freelancer') {
      await client.query('ROLLBACK')

      return res.status(403).json({
        Error: 'Only freelancers can apply for jobs.',
      })
    }

    // CHECK IF JOB IS LIVE
    // AND MAKE SURE FREELANCER DOES NOT OWN THE JOB
    const jobResult = await client.query(
      `
        SELECT id
        FROM jobs
        WHERE id = $1
        AND status = $2
        AND client_id != $3
      `,
      [id, 'live', userId],
    )

    if (!jobResult.rows[0]) {
      await client.query('ROLLBACK')

      return res.status(400).json({
        Error: 'Job is not available for application.',
      })
    }

    // CREATE APPLICATION
    // APPLICATION: pending
    await client.query(
      `
        INSERT INTO applications (
          job_id,
          freelancer_id,
          proposal,
          proposal_price,
          status
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [id, userId, proposal, proposedPrice, 'pending'],
    )

    // UPDATE JOB STATUS
    // JOB: live -> in_progress

    await client.query('COMMIT')

    return res.status(201).json({
      message: 'Application submitted successfully.',
    })
  } catch (err) {
    await client.query('ROLLBACK')

    console.log({
      Error: err.message,
    })

    if (err.code === '23505') {
      return res.status(409).json({
        error: 'You have already applied to this job.',
      })
    }

    return res.status(500).json({
      Error: 'Internal server error.',
    })
  } finally {
    client.release()
  }
}

async function getMyApplications(req, res) {
  const userId = req.session.userId

  try {
    const result = await pool.query(
      `
        SELECT
          A.job_id,
          A.proposal,
          A.proposal_price,
          A.status,
          A.created_on,
          J.title AS job_title,
          J.status AS job_status,
          FP.experience
        FROM applications A
        JOIN jobs J
          ON A.job_id = J.id
        JOIN freelancer_profiles FP
          ON A.freelancer_id = FP.user_id
        WHERE A.freelancer_id = $1
        ORDER BY A.created_on DESC
      `,
      [userId],
    )

    return res.status(200).json(result.rows)
  } catch (err) {
    console.log({ Error: err.message })

    return res.status(500).json({
      Error: 'Internal server error.',
    })
  }
}

async function getMyProjects(req, res) {
  const freelancerId = req.session.userId

  try {
    const getMyProjectsResult = await pool.query(
      `
        SELECT
          P.id,
          P.started_on,
          P.status,
          P.agreed_price,
          U.name AS freelancer_name,
          U1.name AS client_name,
          J.title
        FROM projects P
        JOIN users U
          ON P.freelancer_id = U.id
        JOIN users U1
          ON P.client_id = U1.id
        JOIN jobs J
          ON P.job_id = J.id
        WHERE P.freelancer_id = $1
      `,
      [freelancerId],
    )

    return res.status(200).json(getMyProjectsResult.rows)
  } catch (err) {
    console.log({ Error: err.message })

    return res.status(500).json({
      Error: 'Internal server error.',
    })
  }
}

async function getProjectWithID(req, res) {
  const freelancerId = req.session.userId
  const { projectId } = req.params

  try {
    const getProjectWithIDResult = await pool.query(
      `
        SELECT
          P.started_on,
          P.status,
          P.agreed_price,
          U.name AS freelancer_name,
          U1.id AS client_id,
          U1.name AS client_name,
          J.title,
          J.description,
          J.created_on,
          J.category,
          J.budget
        FROM projects P
        JOIN users U
          ON P.freelancer_id = U.id
        JOIN users U1
          ON P.client_id = U1.id
        JOIN jobs J
          ON P.job_id = J.id
        WHERE P.freelancer_id = $1
        AND P.id = $2
      `,
      [freelancerId, projectId],
    )

    if (!getProjectWithIDResult.rows[0]) {
      return res.status(404).json({
        Error: 'Project not found.',
      })
    }

    return res.status(200).json(getProjectWithIDResult.rows[0])
  } catch (err) {
    console.log({ Error: err.message })

    return res.status(500).json({
      Error: 'Internal server error.',
    })
  }
}

async function submitProject(req, res) {
  const freelancerId = req.session.userId
  const { projectId } = req.params

  try {
    // PROJECT:
    // in_progress -> submitted
    const submitProjectResult = await pool.query(
      `
        UPDATE projects
        SET status = $1,
            updated_on = NOW()
        WHERE freelancer_id = $2
        AND id = $3
        AND status = $4
      `,
      ['submitted', freelancerId, projectId, 'in_progress'],
    )

    if (!submitProjectResult.rowCount) {
      return res.status(404).json({
        Error: 'Project not found.',
      })
    }

    return res.status(204).end()
  } catch (err) {
    console.log({ Error: err.message })

    return res.status(500).json({
      Error: 'Internal server error.',
    })
  }
}

async function getFreelancerDashboard(req, res) {
  const freelancerId = req.session.userId

  try {
    const [
      userResult,
      availableJobsResult,
      applicationsResult,
      activeProjectsResult,
      completedProjectsResult,
      recentApplicationsResult,
      activeProjectsListResult,
    ] = await Promise.all([
      pool.query(
        `
          SELECT name
          FROM users
          WHERE id = $1
        `,
        [freelancerId],
      ),

      // LIVE JOBS ARE AVAILABLE TO FREELANCERS
      pool.query(
        `
          SELECT COUNT(*) AS count
          FROM jobs
          WHERE status = 'live'
        `,
      ),

      // ALL APPLICATIONS SUBMITTED BY THIS FREELANCER
      pool.query(
        `
          SELECT COUNT(*) AS count
          FROM applications
          WHERE freelancer_id = $1
        `,
        [freelancerId],
      ),

      // ACTIVE PROJECT COUNT
      pool.query(
        `
          SELECT COUNT(*) AS count
          FROM projects
          WHERE freelancer_id = $1
          AND status = 'in_progress'
        `,
        [freelancerId],
      ),

      // COMPLETED PROJECT COUNT
      pool.query(
        `
          SELECT COUNT(*) AS count
          FROM projects
          WHERE freelancer_id = $1
          AND status = 'completed'
        `,
        [freelancerId],
      ),

      // RECENT APPLICATIONS
      pool.query(
        `
          SELECT
            A.job_id,
            A.proposal_price,
            A.status,
            A.created_on,
            J.title AS job_title,
            J.budget,
            J.category
          FROM applications A
          JOIN jobs J
            ON A.job_id = J.id
          WHERE A.freelancer_id = $1
          ORDER BY A.created_on DESC
          LIMIT 5
        `,
        [freelancerId],
      ),

      // ACTIVE PROJECTS
      pool.query(
        `
          SELECT
            P.id,
            P.status,
            P.agreed_price,
            P.started_on,
            J.title
          FROM projects P
          JOIN jobs J
            ON P.job_id = J.id
          WHERE P.freelancer_id = $1
          AND (P.status = 'in_progress' OR P.status= 'submitted')
          ORDER BY P.started_on DESC
          LIMIT 5
        `,
        [freelancerId],
      ),
    ])

    if (!userResult.rows[0]) {
      return res.status(404).json({
        Error: 'User not found.',
      })
    }

    return res.status(200).json({
      name: userResult.rows[0].name,

      availableJobs: Number(availableJobsResult.rows[0].count),

      totalApplications: Number(applicationsResult.rows[0].count),

      activeProjects: Number(activeProjectsResult.rows[0].count),

      completedProjects: Number(completedProjectsResult.rows[0].count),

      recentApplications: recentApplicationsResult.rows,

      activeProjectsList: activeProjectsListResult.rows,
    })
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getMyProfile(req, res) {
  const userId = req.session.userId

  try {
    const result = await pool.query(
      `
        SELECT
          U.id,
          U.name,
          U.email,
          FP.professional_title,
          FP.skills,
          FP.experience,
          FP.hourly_rate,
          FP.bio,
          FP.location
        FROM users U
        JOIN freelancer_profiles FP
          ON U.id = FP.user_id
        WHERE U.id = $1
      `,
      [userId],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Profile not found.',
      })
    }

    return res.status(200).json(result.rows[0])
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getJobWithID(req, res) {
  const { id } = req.params

  try {
    const result = await pool.query(
      `
        SELECT
          j.id,
          j.title,
          j.description,
          j.budget,
          j.category,
          j.status,
          j.created_on,
          u.id AS client_id,
          u.name AS client_name
        FROM jobs j
        JOIN users u
          ON j.client_id = u.id
        WHERE j.id = $1
      `,
      [id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Job not found.',
      })
    }

    return res.status(200).json(result.rows[0])
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getApplicationDetails(req, res) {
  const { jobId } = req.params
  const freelancerId = req.session.userId

  try {
    const result = await pool.query(
      `
      SELECT
        a.job_id,
        a.freelancer_id,
        a.proposal,
        a.proposal_price,
        a.status,
        a.created_on,
        a.updated_on,

        j.title,
        j.description,
        j.budget,
        j.category,
        j.status AS job_status,
        j.created_on AS job_created_on,

        u.id AS client_id,
        u.name AS client_name

      FROM applications a

      JOIN jobs j
        ON a.job_id = j.id

      JOIN users u
        ON j.client_id = u.id

      WHERE a.job_id = $1
        AND a.freelancer_id = $2
      `,
      [jobId, freelancerId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Application not found.',
      })
    }

    res.status(200).json({
      application: result.rows[0],
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error.',
    })
  }
}

async function getClientProfile(req, res) {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        cp.company,
        cp.location,
        cp.description
      FROM users u
      JOIN client_profiles cp
        ON u.id = cp.user_id
      WHERE u.id = $1
        AND u.role = 'client'
      `,
      [userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Client not found.',
      })
    }
    res.status(200).json({
      client: result.rows[0],
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error.',
    })
  }
}

export {
  getAllJobs,
  createApplication,
  getMyApplications,
  getMyProjects,
  getProjectWithID,
  submitProject,
  getFreelancerDashboard,
  getMyProfile,
  getJobWithID,
  getApplicationDetails,
  getClientProfile,
}
