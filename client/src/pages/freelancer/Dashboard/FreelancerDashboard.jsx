import React from 'react'
import { Link } from 'react-router-dom'

import '../../../styles/dashboard.css'

import { IoBriefcaseOutline } from 'react-icons/io5'
import { HiMiniDocumentText } from 'react-icons/hi2'
import { BsCheckCircle } from 'react-icons/bs'

export default function FreelancerDashboard() {
  const [dashboard, setDashboard] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function getDashboard() {
      try {
        const res = await fetch('/api/freelancer/dashboard')

        const data = await res.json()

        if (!res.ok) {
          setError(data.Error || 'Unable to load dashboard.')
          return
        }

        setDashboard(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    getDashboard()
  }, [])

  if (loading) {
    return <p>Loading dashboard...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {dashboard.name}</h1>
        <p>Here's what's happening with your work.</p>
      </div>

      <div className="dashboard-stats">
        <article className="dashboard-card">
          <div className="card-value">
            <div className="card-icon active-jobs-icon">
              <IoBriefcaseOutline />
            </div>

            <strong>{dashboard.activeProjects}</strong>
          </div>

          <span>Active Projects</span>
        </article>

        <article className="dashboard-card">
          <div className="card-value">
            <div className="card-icon applications-icon">
              <HiMiniDocumentText />
            </div>

            <strong>{dashboard.totalApplications}</strong>
          </div>

          <span>Applications</span>
        </article>

        <article className="dashboard-card">
          <div className="card-value">
            <div className="card-icon hired-icon">
              <BsCheckCircle />
            </div>

            <strong>{dashboard.completedProjects}</strong>
          </div>

          <span>Completed</span>
        </article>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Applications</h2>

          <Link to="/freelancer/applications" className="view-all-btn">
            All Applications
          </Link>
        </div>

        {dashboard.recentApplications.length === 0 ? (
          <p className="empty-state">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="dashboard-list">
            {dashboard.recentApplications.slice(0, 5).map((application) => (
              <Link
                to={`applications/${application.job_id}`}
                className="job-card"
                key={application.job_id}
              >
                <div className="job-card-header">
                  <h2>{application.job_title}</h2>

                  <span className={`job-status ${application.status}`}>
                    <span className="status-dot"></span>

                    {application.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="job-card-info">
                  <span className="job-category">{application.category}</span>

                  <span className="job-location">Remote</span>

                  <strong>
                    ₹
                    {Number(application.proposal_price).toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="job-card-divider"></div>

                <span className="job-date">
                  Applied{' '}
                  {new Date(application.created_on).toLocaleDateString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'short',
                    },
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Active Projects</h2>

          <Link to="/freelancer/projects" className="view-all-btn">
            All Projects
          </Link>
        </div>

        {(dashboard.activeProjectsList ?? []).length === 0 ? (
          <p className="empty-state">You don't have any active projects.</p>
        ) : (
          <div className="dashboard-list">
            {dashboard.activeProjectsList.slice(0, 5).map((project) => (
              <Link
                to={`/freelancer/projects/${project.id}/details`}
                className="job-card"
                key={project.id}
              >
                <div className="job-card-header">
                  <h2>{project.title}</h2>

                  <span className={`job-status ${project.status}`}>
                    <span className="status-dot"></span>

                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="job-card-info">
                  <span className="job-category">Project</span>

                  <span className="job-location">Remote</span>

                  <strong>
                    ₹{Number(project.agreed_price).toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="job-card-divider"></div>

                <span className="job-date">
                  Started{' '}
                  {new Date(project.started_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
