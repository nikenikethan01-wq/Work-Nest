import './projects.css'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faBriefcase,
  faCheck,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons'
import getOrCreateConversation from '../../../utils/getOrCreateConversation.js'

export default function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function getProjects() {
      try {
        const res = await fetch('/api/client/projects')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
          return
        }

        setProjects(data)
      } catch (err) {
        console.log(err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getProjects()
  }, [])

  async function completeProject(projectId) {
    setError('')

    try {
      const res = await fetch(`/api/client/project/${projectId}/status`, {
        method: 'PATCH',
      })

      if (!res.ok) {
        const data = await res.json()

        setError(data.error || 'Unable to complete project.')
        return
      }

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                status: 'completed',
              }
            : project,
        ),
      )
    } catch (err) {
      console.log(err.message)
      setError('Unable to complete project.')
    }
  }

  if (loading) {
    return (
      <section className="projects-page">
        <p className="projects-message">Loading projects...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="projects-page">
        <p className="projects-message projects-error">{error}</p>
      </section>
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
    <section className="projects-page">
      <div className="projects-header">
        <Link to="/client" className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Dashboard</span>
        </Link>

        <h1>Projects</h1>

        <p>Manage your active and completed projects.</p>
      </div>

      {projects.length === 0 ? (
        <div className="projects-empty">
          <div className="projects-empty-icon">
            <FontAwesomeIcon icon={faBriefcase} />
          </div>

          <h2>No projects yet</h2>

          <p>Projects will appear here when you hire a freelancer.</p>

          <Link to="/client/jobs" className="projects-empty-btn">
            View My Jobs
          </Link>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-header">
                <div>
                  <h2>{project.title}</h2>
                </div>

                <span className={`project-status ${project.status}`}>
                  <span className="status-dot"></span>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <div className="project-meta">
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

              <div className="project-card-footer">
                <Link
                  to={`/client/projects/${project.id}`}
                  className="project-view-btn"
                >
                  View Details
                </Link>

                {project.status === 'submitted' && (
                  <button
                    type="button"
                    className="project-complete-btn"
                    onClick={() => completeProject(project.id)}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Complete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
