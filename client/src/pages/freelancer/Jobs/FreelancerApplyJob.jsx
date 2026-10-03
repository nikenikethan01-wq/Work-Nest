import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faBriefcase,
  faIndianRupeeSign,
  faTag,
  faUser,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import './apply-job.css'
import getOrCreateConversation from '../../../utils/getOrCreateConversation'

export default function FreelancerApplyJob() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = React.useState(null)

  const [formData, setFormData] = React.useState({
    proposal: '',
    proposedPrice: '',
  })

  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  React.useEffect(() => {
    async function getJob() {
      try {
        const res = await fetch(`/api/freelancer/jobs/${id}`)

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.Error || 'Failed to fetch job.')
        }

        setJob(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getJob()
  }, [id])

  function handleChange(ev) {
    const { name, value } = ev.currentTarget

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(ev) {
    ev.preventDefault()

    setError('')
    setSuccess('')

    const proposedPrice = Number(formData.proposedPrice)

    if (!formData.proposal.trim()) {
      setError('Please enter your proposal.')
      return
    }

    if (!Number.isFinite(proposedPrice) || proposedPrice <= 0) {
      setError('Please enter a valid proposed price.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/freelancer/jobs/${id}/application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal: formData.proposal,
          proposedPrice,
          status: 'pending',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.Error || 'Failed to submit application.')
      }

      setSuccess('Application submitted successfully.')

      setTimeout(() => {
        navigate('/freelancer/applications')
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
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
    return <p className="apply-job-message">Loading job...</p>
  }

  if (error && !job) {
    return (
      <main className="apply-job-page">
        <Link to="/freelancer/jobs" className="back-jobs-link">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Jobs
        </Link>

        <p className="apply-job-message apply-job-error">{error}</p>
      </main>
    )
  }

  return (
    <main className="apply-job-page">
      <Link to="/freelancer/jobs" className="back-jobs-link">
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to Jobs
      </Link>

      {/* =========================
          JOB DETAILS
      ========================= */}

      <section className="apply-job-details">
        <div className="apply-job-details-header">
          <div className="apply-job-title-wrapper">
            <div className="apply-job-icon">
              <FontAwesomeIcon icon={faBriefcase} />
            </div>

            <div>
              <h1>{job.title}</h1>
              <span>Job Details</span>
            </div>
          </div>
        </div>

        <div className="apply-job-description">
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>

        <div className="apply-job-meta">
          <div className="apply-job-meta-item">
            <FontAwesomeIcon icon={faIndianRupeeSign} />

            <div>
              <span>Budget</span>
              <strong>₹{Number(job.budget).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="apply-job-meta-item">
            <FontAwesomeIcon icon={faTag} />

            <div>
              <span>Category</span>
              <strong>{job.category}</strong>
            </div>
          </div>

          <div className="apply-job-meta-item">
            <FontAwesomeIcon icon={faUser} />

            <div className="job-client">
              <span>Posted by</span>

              <div className="job-client-row">
                <strong>{job.client_name}</strong>

                <button
                  type="button"
                  className="job-client-chat"
                  onClick={() => handleMessageClick(job.client_id)}
                  aria-label={`Chat with ${job.client_name}`}
                  title={`Chat with ${job.client_name}`}
                >
                  <FontAwesomeIcon icon={faCommentDots} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          APPLICATION FORM
      ========================= */}

      <section className="apply-form-section">
        <div className="apply-form-header">
          <h2>Your Proposal</h2>
          <p>Tell the client why you are a good fit for this project.</p>
        </div>

        <form className="apply-job-form" onSubmit={handleSubmit}>
          <div className="apply-job-field">
            <label htmlFor="proposal">Proposal</label>

            <textarea
              id="proposal"
              name="proposal"
              value={formData.proposal}
              onChange={handleChange}
              placeholder="Explain your approach, experience, and why you are a good fit..."
              rows="7"
            />
          </div>

          <div className="apply-job-field">
            <label htmlFor="proposedPrice">Proposed Price</label>

            <input
              id="proposedPrice"
              name="proposedPrice"
              type="number"
              min="1"
              value={formData.proposedPrice}
              onChange={handleChange}
              placeholder="Enter your proposed price"
            />
          </div>

          {error && (
            <p className="apply-job-message apply-job-error">{error}</p>
          )}

          {success && (
            <p className="apply-job-message apply-job-success">{success}</p>
          )}

          <button
            type="submit"
            className="submit-application-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </section>
    </main>
  )
}
