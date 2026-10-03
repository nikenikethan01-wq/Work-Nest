import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faUser,
  faBriefcase,
  faIndianRupeeSign,
  faCalendar,
  faCircleInfo,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import './application-details.css'
import getOrCreateConversation from '../../../utils/getOrCreateConversation'

export default function FreelancerApplicationDetails() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [application, setApplication] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const getApplication = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/freelancer/applications/${jobId}`,
          {
            credentials: 'include',
          },
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load application.')
        }

        setApplication(data.application)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getApplication()
  }, [jobId])

  if (loading) {
    return <p className="application-details-message">Loading...</p>
  }

  if (error) {
    return (
      <div className="application-details-message application-details-error">
        <p>{error}</p>

        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    )
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
    <div className="application-details-page">
      <button
        type="button"
        className="application-back-btn"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back</span>
      </button>

      <div className="application-details-header">
        <div>
          <h2>{application.title}</h2>
          <p>{application.category}</p>
        </div>

        <span className={`job-status ${application.status}`}>
          <span className="status-dot"></span>
          {application.status.replace('_', ' ')}
        </span>
      </div>

      <div className="application-details-card">
        {/* JOB DETAILS */}

        <div className="application-section">
          <div className="application-section-title">
            <FontAwesomeIcon icon={faBriefcase} />
            <h3>Job Details</h3>
          </div>

          <p className="application-job-description">
            {application.description}
          </p>

          <div className="application-info-grid">
            <div className="application-info-item">
              <FontAwesomeIcon icon={faIndianRupeeSign} />

              <div>
                <span>Job Budget</span>

                <strong>
                  ₹{Number(application.budget).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="application-info-item">
              <FontAwesomeIcon icon={faCircleInfo} />

              <div>
                <span>Job Status</span>

                <strong>{application.job_status}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CLIENT */}

        <div className="application-section">
          <div className="application-section-title">
            <FontAwesomeIcon icon={faUser} />
            <h3>Client</h3>
          </div>

          <div className="application-client">
            <strong>{application.client_name}</strong>

            <button
              type="button"
              className="application-client-chat"
              onClick={() => handleMessageClick(application.client_id)}
              aria-label={`Message ${application.client_name}`}
              title={`Message ${application.client_name}`}
            >
              <FontAwesomeIcon icon={faCommentDots} />
            </button>
          </div>
        </div>

        {/* APPLICATION */}

        <div className="application-section">
          <div className="application-section-title">
            <FontAwesomeIcon icon={faCircleInfo} />
            <h3>Your Application</h3>
          </div>

          <div className="application-info-grid">
            <div className="application-info-item">
              <FontAwesomeIcon icon={faIndianRupeeSign} />

              <div>
                <span>Your Proposed Price</span>

                <strong>
                  ₹{Number(application.proposal_price).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="application-info-item">
              <FontAwesomeIcon icon={faCalendar} />

              <div>
                <span>Applied On</span>

                <strong>
                  {new Date(application.created_on).toLocaleDateString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="application-proposal">
            <span>Your Proposal</span>

            <p>{application.proposal}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
