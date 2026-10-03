import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBriefcase,
  faUser,
  faBuilding,
  faTag,
  faIndianRupeeSign,
  faCalendar,
  faCheck,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import './project-details.css'
import getOrCreateConversation from '../../../utils/getOrCreateConversation'

export default function FreelancerProjectDetails() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    async function getProjectDetails() {
      try {
        const res = await fetch(`/api/freelancer/projects/${projectId}`)

        const data = await res.json()

        if (!res.ok) {
          setError(data.Error || 'Unable to load project.')
          return
        }

        setProject(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load project.')
      } finally {
        setLoading(false)
      }
    }

    getProjectDetails()
  }, [projectId])

  console.log(project)

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/freelancer/project/${projectId}/submit`, {
        method: 'PATCH',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Unable to submit project.')
        return
      }

      setProject((prevProject) => ({
        ...prevProject,
        status: 'submitted',
      }))
    } catch (err) {
      console.error(err)
      setError('Unable to submit project.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="project-details-page">
        <p className="project-details-message">Loading project...</p>
      </main>
    )
  }

  if (error && !project) {
    return (
      <main className="project-details-page">
        <Link to="/freelancer/projects" className="back-link">
          <IoArrowBack />
          <span>Back to Projects</span>
        </Link>

        <p className="project-details-error">{error}</p>
      </main>
    )
  }

  if (!project) {
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
    <main className="project-details-page">
      <Link to="/freelancer/projects" className="back-link">
        <IoArrowBack />
        <span>Back to Projects</span>
      </Link>

      {error && <p className="project-details-error">{error}</p>}

      <section className="project-details-card">
        <div className="project-details-header">
          <div className="project-details-title">
            <div className="project-details-icon">
              <FontAwesomeIcon icon={faBriefcase} />
            </div>

            <div>
              <span className="project-details-label">Project</span>

              <h1>{project.title}</h1>
            </div>
          </div>

          <span className={`project-status ${project.status}`}>
            <span className="status-dot"></span>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <div className="project-details-meta">
          <div className="project-meta-item">
            <FontAwesomeIcon icon={faIndianRupeeSign} />

            <div>
              <span>Agreed Price</span>
              <strong>
                ₹{Number(project.agreed_price).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="project-meta-item">
            <FontAwesomeIcon icon={faIndianRupeeSign} />

            <div>
              <span>Job Budget</span>
              <strong>₹{Number(project.budget).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="project-meta-item">
            <FontAwesomeIcon icon={faTag} />

            <div>
              <span>Category</span>
              <strong>{project.category}</strong>
            </div>
          </div>

          <div className="project-meta-item">
            <FontAwesomeIcon icon={faCalendar} />

            <div>
              <span>Started</span>
              <strong>
                {new Date(project.started_on).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="project-job-card">
        <div className="project-section-header">
          <h2>Project Description</h2>
        </div>

        <p className="project-description">{project.description}</p>
      </section>

      <section className="project-people-card">
        <div className="project-person">
          <div className="person-icon">
            <FontAwesomeIcon icon={faUser} />
          </div>

          <div>
            <span>Freelancer</span>
            <strong>{project.freelancer_name}</strong>
          </div>
        </div>

        <div className="project-person">
          <div className="person-icon">
            <FontAwesomeIcon icon={faBuilding} />
          </div>

          <div>
            <span>Client</span>

            <div className="project-client">
              <strong>{project.client_name}</strong>

              <button
                type="button"
                className="project-client-chat"
                onClick={() => handleMessageClick(project.client_id)}
                aria-label={`Message ${project.client_name}`}
                title={`Message ${project.client_name}`}
              >
                <FontAwesomeIcon icon={faCommentDots} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {project.status === 'in_progress' && (
        <div className="project-submit-section">
          <button
            type="button"
            className="submit-project-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <FontAwesomeIcon icon={faCheck} />

            {submitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>
      )}
    </main>
  )
}
