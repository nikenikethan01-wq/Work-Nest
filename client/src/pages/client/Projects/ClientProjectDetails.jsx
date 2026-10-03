import './project-details.css'
import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faBriefcase,
  faCheck,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import getOrCreateConversation from '../../../utils/getOrCreateConversation'

export default function ClientProjectDetails() {
  const { projectId } = useParams()

  const [project, setProject] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const navigate = useNavigate()

  React.useEffect(() => {
    async function getProjectDetails() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/client/projects/${projectId}`,
          {
            credentials: 'include',
          },
        )

        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
          return
        }

        setProject(data)
      } catch (err) {
        console.log(err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getProjectDetails()
  }, [projectId])

  async function completeProject(projectId) {
    setError('')

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/client/project/${projectId}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      )

      if (!res.ok) {
        const data = await res.json()

        setError(data.error || 'Unable to complete project.')
        return
      }

      setProject((prevProject) => ({
        ...prevProject,
        status: 'completed',
      }))
    } catch (err) {
      console.log(err.message)
      setError('Unable to complete project.')
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
      <section className="project-details-page">
        <p className="project-details-message">Loading project...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="project-details-page">
        <p className="project-details-message project-details-error">{error}</p>
      </section>
    )
  }

  if (!project) {
    return null
  }

  return (
    <section className="project-details-page">
      <Link to="/client/projects" className="back-link">
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Projects</span>
      </Link>

      <section className="project-details-card">
        <div className="project-details-header">
          <div>
            <span className="project-details-label">Project</span>

            <h1>{project.title}</h1>
          </div>

          <span className={`project-status ${project.status}`}>
            <span className="status-dot"></span>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <div className="project-details-meta">
          <div>
            <span>Freelancer</span>

            <div className="project-freelancer">
              <strong>{project.freelancer_name}</strong>

              <button
                type="button"
                className="project-freelancer-chat"
                onClick={() => handleMessageClick(project.freelancer_id)}
                aria-label={`Message ${project.freelancer_name}`}
                title={`Message ${project.freelancer_name}`}
              >
                <FontAwesomeIcon icon={faCommentDots} />
              </button>
            </div>
          </div>

          <div>
            <span>Client</span>
            <strong>{project.client_name}</strong>
          </div>

          <div>
            <span>Agreed Price</span>
            <strong>
              ₹{Number(project.agreed_price).toLocaleString('en-IN')}
            </strong>
          </div>

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
        {project.status === 'submitted' && (
          <div className="project-complete-section">
            <button
              type="button"
              className="project-complete-btn"
              onClick={completeProject}
            >
              <FontAwesomeIcon icon={faCheck} />
              Complete Project
            </button>
          </div>
        )}
      </section>

      <section className="project-job-card">
        <div className="project-section-heading">
          <FontAwesomeIcon icon={faBriefcase} />

          <div>
            <h2>Job Details</h2>
            <p>Details of the job associated with this project.</p>
          </div>
        </div>

        <div className="project-job-title">
          <span>Job Title</span>
          <h3>{project.title}</h3>
        </div>

        <div className="project-job-description">
          <span>Job Description</span>
          <p>{project.description}</p>
        </div>
      </section>
    </section>
  )
}
