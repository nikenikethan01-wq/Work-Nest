import './job-details.css'
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faPen,
  faTrash,
  faUser,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import getOrCreateConversation from '../../../utils/getOrCreateConversation'

export default function ClientJobDetails() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = React.useState(null)
  const [applications, setApplications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [acceptedApplication, setAcceptedApplication] = React.useState(null)

  React.useEffect(() => {
    async function getJobDetails() {
      try {
        const jobsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/client/jobs/${jobId}`,
          {
            credentials: 'include',
          },
        )

        const jobsData = await jobsRes.json()

        if (!jobsRes.ok) {
          setError(jobsData.error)
          return
        }

        const applicationsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/client/jobs/${jobId}/applications`,
          {
            credentials: 'include',
          },
        )
        const applicationsData = await applicationsRes.json()

        if (!applicationsRes.ok) {
          setError(applicationsData.error)
          return
        }

        setJob(jobsData)
        setApplications(applicationsData)
      } catch (err) {
        console.log(err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getJobDetails()
  }, [jobId])

  async function handleAccept(application) {
    setAcceptedApplication(application.freelancer_id)

    const freelancerId = application.freelancer_id

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/client/applications/${jobId}/${freelancerId}/accept`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      )

      const data = await res.json()

      if (!res.ok) {
        setAcceptedApplication(null)
        setError(data.error)
        return
      }

      setApplications((prev) =>
        prev.map((item) =>
          item.freelancer_id === application.freelancer_id
            ? { ...item, status: 'accepted' }
            : { ...item, status: 'rejected' },
        ),
      )

      setJob((prev) => ({
        ...prev,
        status: 'in_progress',
      }))
    } catch (err) {
      setAcceptedApplication(null)
      console.log(err.message)
      setError(err.message)
    }
  }

  async function handleReject(application) {
    const freelancerId = application.freelancer_id

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/client/applications/${jobId}/${freelancerId}/reject`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setApplications((prev) =>
        prev.map((item) =>
          item.freelancer_id === application.freelancer_id
            ? { ...item, status: 'rejected' }
            : item,
        ),
      )
    } catch (err) {
      console.log(err.message)
      setError(err.message)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this job?',
    )

    if (!confirmed) {
      return
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/client/jobs/${jobId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      navigate('/client/jobs')
    } catch (err) {
      console.log(err.message)
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <section className="job-details-page">
        <p className="jobs-message">Loading job...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="job-details-page">
        <p className="jobs-message jobs-error">{error}</p>
      </section>
    )
  }

  if (!job) {
    return null
  }

  async function handleMessageClick(otherUserId) {
    try {
      const conversationId = await getOrCreateConversation(otherUserId)
      navigate(`/chat/${conversationId}`)
    } catch (err) {
      console.log(err.message)
      setError('Unable to open conversation.')
    }
  }

  return (
    <section className="job-details-page">
      <button
        type="button"
        className="job-details-back"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Jobs</span>
      </button>

      <section className="job-details-card">
        <div className="job-details-header">
          <div>
            <span className="job-details-category">{job.category}</span>

            <h1>{job.title}</h1>
          </div>

          <span className={`job-status ${job.status}`}>
            <span className="status-dot"></span>
            {job.status.replace('_', ' ')}
          </span>
        </div>

        <div className="job-details-meta">
          <div className="job-detail-meta-item">
            <span>Budget</span>

            <strong>₹{Number(job.budget).toLocaleString('en-IN')}</strong>
          </div>

          <div className="job-detail-meta-item">
            <span>Location</span>

            <strong>Remote</strong>
          </div>

          <div className="job-detail-meta-item">
            <span>Posted</span>

            <strong>
              {new Date(job.created_on).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </strong>
          </div>
        </div>

        <div className="job-details-description">
          <h2>Job Description</h2>

          <p>{job.description}</p>
        </div>

        {job.status === 'live' && (
          <div className="job-details-actions">
            <Link to={`/client/jobs/${jobId}/edit`} className="job-edit-btn">
              <FontAwesomeIcon icon={faPen} />
              Edit Job
            </Link>

            <button
              type="button"
              className="job-delete-btn"
              onClick={handleDelete}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete Job
            </button>
          </div>
        )}
      </section>

      <section className="applications-section">
        <div className="applications-header">
          <div>
            <h2>Applications</h2>
            <p>Freelancers who applied for this job</p>
          </div>
          <span className="application-count">{applications.length}</span>
        </div>

        {applications.length === 0 ? (
          <div className="applications-empty">
            <h3>No applications yet</h3>

            <p>You haven't received any applications for this job.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <article
                className="application-card"
                key={application.freelancer_id}
              >
                <div className="application-header">
                  <div className="applicant-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>

                  <div className="applicant-info">
                    <h3>{application.name}</h3>

                    <span>{application.professional_title}</span>
                  </div>

                  <span className={`application-status ${application.status}`}>
                    {application.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="application-proposal">
                  <span>Proposal</span>

                  <p>{application.proposal}</p>
                </div>

                <div className="application-meta">
                  <div>
                    <span>Proposed Price</span>

                    <strong>
                      ₹
                      {Number(application.proposal_price).toLocaleString(
                        'en-IN',
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Experience</span>

                    <strong>{application.experience} years</strong>
                  </div>

                  <div>
                    <span>Freelancer</span>

                    <div className="application-freelancer">
                      <strong>{application.freelancer_name}</strong>

                      <button
                        type="button"
                        className="application-freelancer-chat"
                        onClick={() =>
                          handleMessageClick(application.freelancer_id)
                        }
                        aria-label={`Message ${application.freelancer_name}`}
                        title={`Message ${application.freelancer_name}`}
                      >
                        <FontAwesomeIcon icon={faCommentDots} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="application-actions">
                  <Link
                    to={`/client/freelancers/${application.freelancer_id}`}
                    className="application-view-btn"
                  >
                    View Freelancer Profile
                  </Link>

                  {application.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="application-reject-btn"
                        onClick={() => handleReject(application)}
                        disabled={acceptedApplication !== null}
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        className="application-accept-btn"
                        onClick={() => handleAccept(application)}
                        disabled={
                          acceptedApplication !== null &&
                          application.freelancer_id !== acceptedApplication
                        }
                      >
                        {acceptedApplication === application.freelancer_id
                          ? 'Accepted'
                          : 'Accept'}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
