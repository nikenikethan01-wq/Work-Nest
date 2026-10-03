import React from 'react'
import { Link } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import './projects.css'

export default function FreelancerProjects() {
  const [projects, setProjects] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [submittingId, setSubmittingId] = React.useState(null)

  React.useEffect(() => {
    async function getProjects() {
      try {
        const res = await fetch('/api/freelancer/projects')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Unable to load projects.')
          return
        }

        setProjects(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load projects.')
      } finally {
        setLoading(false)
      }
    }

    getProjects()
  }, [])

  async function handleSubmit(projectId) {
    setSubmittingId(projectId)
    setError('')

    try {
      const res = await fetch(`/api/freelancer/project/${projectId}/submit`, {
        method: 'PATCH',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Unable to submit project.')
        return
      }

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                status: 'submitted',
              }
            : project,
        ),
      )
    } catch (err) {
      console.error(err)
      setError('Unable to submit project.')
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return (
      <main className="projects-page">
        <p className="projects-message">Loading projects...</p>
      </main>
    )
  }

  return (
    <main className="projects-page">
      <Link to="/freelancer" className="back-dashboard-btn">
        <IoArrowBack />
        <span>Back to Dashboard</span>
      </Link>

      <div className="projects-header">
        <h1>My Projects</h1>
        <p>View and manage the projects you have been hired for.</p>
      </div>

      {error && <p className="projects-error">{error}</p>}

      {projects.length === 0 ? (
        <div className="projects-empty">
          <div className="projects-empty-icon">
            <FontAwesomeIcon icon={faBriefcase} />
          </div>

          <h2>No projects yet</h2>

          <p>Projects will appear here when you hire a freelancer.</p>

          <Link to="/freelancer/jobs" className="projects-empty-btn">
            View Jobs
          </Link>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-header">
                <h2>{project.title}</h2>

                <span className={`project-status ${project.status}`}>
                  <span className="status-dot"></span>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <div className="project-info">
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

              <div className="project-card-actions">
                {project.status === 'in_progress' && (
                  <button
                    type="button"
                    className="submit-project-btn"
                    disabled={submittingId === project.id}
                    onClick={() => handleSubmit(project.id)}
                  >
                    {submittingId === project.id
                      ? 'Submitting...'
                      : 'Submit Project'}
                  </button>
                )}

                <Link
                  to={`/freelancer/projects/${project.id}/details`}
                  className="view-project-btn"
                >
                  View Details
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>

              {project.completed_at && (
                <div className="project-completed">
                  Completed{' '}
                  {new Date(project.completed_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
