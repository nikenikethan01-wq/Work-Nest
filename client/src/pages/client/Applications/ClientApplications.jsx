import './applications.css'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faFileLines,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import getOrCreateConversation from '../../../utils/getOrCreateConversation'

export default function ClientApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [actionLoading, setActionLoading] = React.useState(false)

  React.useEffect(() => {
    async function getApplications() {
      try {
        const res = await fetch('/api/client/applications')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Unable to load applications.')
          return
        }

        setApplications(data)
      } catch (err) {
        console.log(err.message)
        setError('Unable to load applications.')
      } finally {
        setLoading(false)
      }
    }

    getApplications()
  }, [])

  async function handleAccept(jobId, freelancerId) {
    setActionLoading(true)
    setError('')

    try {
      const res = await fetch(
        `/api/client/applications/${jobId}/${freelancerId}/accept`,
        {
          method: 'PATCH',
        },
      )

      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }

      setApplications((prevApplications) =>
        prevApplications.map((application) =>
          application.job_id === jobId &&
          application.freelancer_id === freelancerId
            ? {
                ...application,
                status: 'accepted',
              }
            : application,
        ),
      )
    } catch (err) {
      console.log(err.message)
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(jobId, freelancerId) {
    setActionLoading(true)
    setError('')

    try {
      const res = await fetch(
        `/api/client/applications/${jobId}/${freelancerId}/reject`,
        {
          method: 'PATCH',
        },
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to reject application.')
      }

      setApplications((prevApplications) =>
        prevApplications.map((application) =>
          application.job_id === jobId &&
          application.freelancer_id === freelancerId
            ? {
                ...application,
                status: 'rejected',
              }
            : application,
        ),
      )
    } catch (err) {
      console.log(err.message)
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
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

  if (loading) {
    return (
      <section className="applications-page">
        <p className="applications-message">Loading applications...</p>
      </section>
    )
  }

  if (error && applications.length === 0) {
    return (
      <section className="applications-page">
        <p className="applications-message applications-error">{error}</p>
      </section>
    )
  }

  return (
    <section className="applications-page">
      <div className="applications-page-header">
        <Link to="/client" className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Dashboard</span>
        </Link>

        <h1>Applications</h1>

        <p>Review applications submitted by freelancers for your jobs.</p>
      </div>

      {error && <p className="applications-action-error">{error}</p>}

      {applications.length === 0 ? (
        <div className="applications-page-empty">
          <div className="applications-empty-icon">
            <FontAwesomeIcon icon={faFileLines} />
          </div>

          <h2>No applications yet</h2>

          <p>Applications from freelancers will appear here.</p>

          <Link to="/client/jobs" className="applications-empty-btn">
            View My Jobs
          </Link>
        </div>
      ) : (
        <div className="applications-page-list">
          {applications.map((application) => (
            <article
              className="application-page-card"
              key={`${application.job_id}-${application.freelancer_id}`}
            >
              <div className="application-page-header">
                <div>
                  <span className="application-page-label">Job</span>

                  <Link
                    to={`/client/jobs/${application.job_id}/details`}
                    className="application-job-link"
                  >
                    {application.job_title}
                  </Link>
                </div>

                <span className={`application-status ${application.status}`}>
                  {application.status.replace('_', ' ')}
                </span>
              </div>

              <div className="application-page-meta">
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

                <div>
                  <span>Professional Title</span>
                  <strong>{application.professional_title}</strong>
                </div>

                <div>
                  <span>Proposed Price</span>
                  <strong>
                    ₹
                    {Number(application.proposal_price).toLocaleString('en-IN')}
                  </strong>
                </div>

                <div>
                  <span>Experience</span>
                  <strong>{application.experience} years</strong>
                </div>
              </div>

              <div className="application-page-proposal">
                <span>Proposal</span>

                <p>{application.proposal}</p>
              </div>

              {application.status === 'pending' && (
                <div className="application-page-actions">
                  <button
                    type="button"
                    className="application-reject-btn"
                    disabled={actionLoading}
                    onClick={() =>
                      handleReject(
                        application.job_id,
                        application.freelancer_id,
                      )
                    }
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    className="application-accept-btn"
                    disabled={actionLoading}
                    onClick={() =>
                      handleAccept(
                        application.job_id,
                        application.freelancer_id,
                      )
                    }
                  >
                    Accept
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
