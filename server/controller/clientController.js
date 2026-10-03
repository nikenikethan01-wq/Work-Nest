import pool from '../db/db.js'
import { sanitizeData } from '../utils/clientHelper.js'

async function createJob(req, res) {
  const clientId = req.session.userId
  const { data, error } = sanitizeData(req.body)

  if (error) {
    return res.status(error.status).json({ error: error.message })
  }

  const { title, description, budget, status, category } = data

  // INSERT DATA INTO "jobs" TABLE
  try {
    await pool.query(
      `
        INSERT INTO jobs(
          client_id,
          title,
          description,
          budget,
          status,
          category
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [clientId, title, description, budget, status, category],
    )

    return res.status(201).json({
      message: 'Added job.',
    })
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getAllJobs(req, res) {
  try {
    // GET ALL JOBS DATA FROM "jobs" TABLE
    const result = await pool.query(`
      SELECT
        title,
        description,
        budget,
        status,
        created_on,
        category
      FROM jobs
      ORDER BY created_on DESC
    `)

    if (!result.rows[0]) {
      return res.status(404).json({
        error: 'Jobs not found.',
      })
    }

    return res.status(200).json(result.rows)
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getMyJobs(req, res) {
  const clientId = req.session.userId

  try {
    // GET ONLY USER'S JOBS FROM "jobs" TABLE
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          description,
          budget,
          status,
          created_on,
          category
        FROM jobs
        WHERE client_id = $1
        ORDER BY created_on DESC
      `,
      [clientId],
    )

    return res.status(200).json(result.rows)
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getJobById(req, res) {
  const { jobId } = req.params

  try {
    // GET JOB BY ID FROM "jobs" TABLE
    const result = await pool.query(
      `
        SELECT
          title,
          description,
          budget,
          status,
          created_on,
          category
        FROM jobs

        WHERE id = $1
      `,
      [jobId],
    )

    if (!result.rows[0]) {
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

async function updateJob(req, res) {
  const clientId = req.session.userId
  const { jobId } = req.params

  try {
    // SANITIZE INCOMING DATA
    const { data, error } = sanitizeData(req.body)

    if (error) {
      return res.status(error.status).json({
        error: error.message,
      })
    }

    const { title, description, budget, status, category } = data

    // UPDATE "jobs" TABLE WITH INCOMING DATA
    const result = await pool.query(
      `
        UPDATE jobs
        SET title = $1,
            description = $2,
            budget = $3,
            status = $4,
            category = $5
        WHERE id = $6
        AND status = 'live'
        AND client_id = $7
        RETURNING *
      `,
      [title, description, budget, status, category, jobId, clientId],
    )

    if (!result.rows[0]) {
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

async function deleteJob(req, res) {
  const clientId = req.session.userId
  const { jobId } = req.params

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // DELETE APPLICATIONS BELONGING TO THE JOB
    await client.query(
      `
        DELETE FROM applications
        WHERE job_id = $1
      `,
      [jobId],
    )

    // DELETE PROJECTS BELONGING TO THE JOB
    await client.query(
      `
        DELETE FROM projects
        WHERE job_id = $1
      `,
      [jobId],
    )

    // DELETE JOB ONLY IF IT BELONGS TO THE LOGGED-IN CLIENT
    const result = await client.query(
      `
        DELETE FROM jobs
        WHERE id = $1
        AND client_id = $2
        AND status = 'live'
        RETURNING *
      `,
      [jobId, clientId],
    )

    if (!result.rows[0]) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        error: 'Job not found.',
      })
    }

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Job deleted successfully.',
    })
  } catch (err) {
    await client.query('ROLLBACK')

    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  } finally {
    client.release()
  }
}

async function getJobApplications(req, res) {
  const { jobId } = req.params
  const clientId = req.session.userId

  try {
    // GET ALL APPLICATIONS FOR A SPECIFIC JOB
    const result = await pool.query(
      `
        SELECT
          U.name AS freelancer_name,
          A.freelancer_id,
          A.proposal,
          A.proposal_price,
          A.status,
          A.created_on,
          FP.experience
        FROM applications A
        JOIN jobs J
          ON A.job_id = J.id
        JOIN freelancer_profiles FP
          ON A.freelancer_id = FP.user_id
        JOIN users U 
          ON A.freelancer_id = U.id
        WHERE A.job_id = $1
        AND J.client_id = $2
      `,
      [jobId, clientId],
    )

    return res.status(200).json(result.rows)
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function acceptApplication(req, res) {
  const { jobId, freelancerId } = req.params
  const clientId = req.session.userId

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // UPDATE SELECTED APPLICATION:
    // pending -> accepted
    const applicationsUpdate = await client.query(
      `
        UPDATE applications A
        SET status = $1,
            updated_on = NOW()
        FROM jobs J
        WHERE J.id = A.job_id
        AND A.job_id = $2
        AND A.status = $3
        AND A.freelancer_id = $4
        AND J.client_id = $5
        RETURNING A.proposal_price
      `,
      ['accepted', jobId, 'pending', freelancerId, clientId],
    )

    if (applicationsUpdate.rowCount === 0) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        error: 'Application not found or cannot be accepted.',
      })
    }

    // REJECT ALL OTHER APPLICATIONS:
    // pending -> rejected
    await client.query(
      `
        UPDATE applications A
        SET status = $1,
            updated_on = NOW()
        FROM jobs J
        WHERE J.id = A.job_id
        AND A.job_id = $2
        AND A.freelancer_id <> $3
        AND A.status = $4
        AND J.client_id = $5
      `,
      ['rejected', jobId, freelancerId, 'pending', clientId],
    )

    const proposalPrice = applicationsUpdate.rows[0].proposal_price

    // CREATE PROJECT:
    // in_progress
    await client.query(
      `
        INSERT INTO projects(
          job_id,
          freelancer_id,
          client_id,
          agreed_price,
          status
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [jobId, freelancerId, clientId, proposalPrice, 'in_progress'],
    )

    await client.query('COMMIT')

    return res.status(204).end()
  } catch (err) {
    await client.query('ROLLBACK')

    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  } finally {
    client.release()
  }
}

async function rejectApplications(req, res) {
  const { jobId, freelancerId } = req.params
  const clientId = req.session.userId

  try {
    // UPDATE APPLICATION:
    // pending -> rejected
    const rejectApplicationsResult = await pool.query(
      `
        UPDATE applications A
        SET status = $1,
            updated_on = NOW()
        FROM jobs J
        WHERE A.job_id = J.id
        AND A.job_id = $2
        AND A.status = $3
        AND A.freelancer_id = $4
        AND J.client_id = $5
      `,
      ['rejected', jobId, 'pending', freelancerId, clientId],
    )

    if (rejectApplicationsResult.rowCount === 0) {
      return res.status(404).json({
        error: 'Application not found.',
      })
    }

    return res.status(204).end()
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getMyProjects(req, res) {
  const clientId = req.session.userId

  try {
    const getMyProjectsResult = await pool.query(
      `
    SELECT
      P.id,
      P.started_on,
      P.status,
      P.agreed_price,
      U.name AS freelancer_name,
      U.id AS freelancer_id,
      U1.name AS client_name,
      J.title
    FROM projects P
    JOIN users U
      ON P.freelancer_id = U.id
    JOIN users U1
      ON P.client_id = U1.id
    JOIN jobs J
      ON P.job_id = J.id
    WHERE P.client_id = $1
    ORDER BY
      CASE
        WHEN P.status = 'submitted' THEN 0
        ELSE 1
      END
  `,
      [clientId],
    )

    return res.status(200).json(getMyProjectsResult.rows)
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getProjectWithID(req, res) {
  const clientId = req.session.userId
  const { projectId } = req.params
  console.log(projectId)
  try {
    const getProjectWithIDResult = await pool.query(
      `
        SELECT
          P.started_on,
          P.status,
          P.agreed_price,
          U.name AS freelancer_name,
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
        WHERE P.client_id = $1
        AND P.id = $2
      `,
      [clientId, projectId],
    )

    if (!getProjectWithIDResult.rows[0]) {
      return res.status(404).json({
        error: 'Project not found.',
      })
    }

    return res.status(200).json(getProjectWithIDResult.rows[0])
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function completeProject(req, res) {
  const clientId = req.session.userId
  const { projectId } = req.params

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // PROJECT:
    // submitted -> completed
    const updateProjects = await client.query(
      `
        UPDATE projects
        SET status = $1,
            completed_on = NOW()
        WHERE id = $2
        AND client_id = $3
        AND status = $4
        RETURNING job_id
      `,
      ['completed', projectId, clientId, 'submitted'],
    )

    if (!updateProjects.rowCount) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        error: 'Project not found',
      })
    }

    const jobId = updateProjects.rows[0].job_id

    // JOB:
    // in_progress -> completed
    const updateJobs = await client.query(
      `
        UPDATE jobs J
        SET status = $1,
            updated_on = NOW()
        WHERE id = $2
        AND client_id = $3
        AND status = $4
      `,
      ['completed', jobId, clientId, 'in_progress'],
    )

    if (!updateJobs.rowCount) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        error: 'Job not found',
      })
    }

    await client.query('COMMIT')

    return res.status(204).end()
  } catch (err) {
    await client.query('ROLLBACK')

    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  } finally {
    client.release()
  }
}

async function getClientDashboard(req, res) {
  const clientId = req.session.userId

  try {
    const userResult = await pool.query(
      `
        SELECT name
        FROM users
        WHERE id = $1
      `,
      [clientId],
    )

    const activeJobsResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM jobs
        WHERE client_id = $1
        AND status = 'live'
      `,
      [clientId],
    )

    const applicationsResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM applications A
        JOIN jobs J
          ON A.job_id = J.id
        WHERE J.client_id = $1
      `,
      [clientId],
    )

    const hiredFreelancersResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM projects
        WHERE client_id = $1
      `,
      [clientId],
    )

    const recentJobsResult = await pool.query(
      `
        SELECT
          id,
          title,
          budget,
          status,
          category,
          created_on
        FROM jobs
        WHERE client_id = $1
        ORDER BY created_on DESC
        LIMIT 5
      `,
      [clientId],
    )

    if (!userResult.rows[0]) {
      return res.status(404).json({
        error: 'User not found.',
      })
    }

    return res.status(200).json({
      name: userResult.rows[0].name,
      activeJobs: Number(activeJobsResult.rows[0].count),
      totalApplications: Number(applicationsResult.rows[0].count),
      hiredFreelancers: Number(hiredFreelancersResult.rows[0].count),
      recentJobs: recentJobsResult.rows,
    })
  } catch (err) {
    console.log({ error: err.message })

    return res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

async function getMyApplications(req, res) {
  const clientId = req.session.userId

  try {
    const result = await pool.query(
      `
        SELECT
          A.job_id,
          A.freelancer_id,
          A.proposal,
          A.proposal_price,
          A.status,
          A.created_on,
          A.updated_on,
          U.name AS freelancer_name,
          FP.professional_title,
          FP.experience,
          J.title AS job_title,
          J.status AS job_status
        FROM applications A
        JOIN jobs J
          ON A.job_id = J.id
        JOIN users U
          ON A.freelancer_id = U.id
        JOIN freelancer_profiles FP
          ON A.freelancer_id = FP.user_id
        WHERE J.client_id = $1
        ORDER BY A.created_on DESC
      `,
      [clientId],
    )

    return res.status(200).json(result.rows)
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
          CP.company,
          CP.location,
          CP.description
        FROM users U
        JOIN client_profiles CP
          ON U.id = CP.user_id
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

async function getFreelancerProfile(req, res) {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        fp.professional_title,
        fp.skills,
        fp.experience,
        fp.hourly_rate,
        fp.bio,
        fp.location
      FROM users u
      JOIN freelancer_profiles fp
        ON u.id = fp.user_id
      WHERE u.id = $1
        AND u.role = 'freelancer'
      `,
      [userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Freelancer not found.',
      })
    }

    return res.status(200).json({
      freelancer: result.rows[0],
    })
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: 'Server error.',
    })
  }
}

export {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobApplications,
  acceptApplication,
  rejectApplications,
  getMyProjects,
  getProjectWithID,
  completeProject,
  getClientDashboard,
  getMyApplications,
  getMyProfile,
  getFreelancerProfile,
}
