import React from 'react'
import { Link } from 'react-router-dom'
import { IoBriefcaseOutline } from 'react-icons/io5'
import { HiMiniDocumentText } from 'react-icons/hi2'
import { BsPersonCheck } from 'react-icons/bs'

export default function ClientDashboard() {
  const [dashboard, setDashboard] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function getDashboard() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/client/dashboard`,
          {
            credentials: 'include',
          },
        )
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

            <strong>{dashboard.activeJobs}</strong>
          </div>

          <span>Live Jobs</span>
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
              <BsPersonCheck />
            </div>

            <strong>{dashboard.hiredFreelancers}</strong>
          </div>

          <span>Hired</span>
        </article>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Jobs</h2>

          <Link to="/client/jobs" className="view-all-btn">
            All Jobs
          </Link>
        </div>

        {dashboard.recentJobs.length === 0 ? (
          <p className="empty-state">You haven't posted any jobs yet.</p>
        ) : (
          <div className="dashboard-list">
            {dashboard.recentJobs.slice(0, 5).map((job) => (
              <Link
                to={`/client/jobs/${job.id}/details`}
                className="job-card"
                key={job.id}
              >
                <div className="job-card-header">
                  <h2>{job.title}</h2>

                  <span className={`job-status ${job.status}`}>
                    <span className="status-dot"></span>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="job-card-info">
                  <span className="job-category">{job.category}</span>

                  <span className="job-location">Remote</span>

                  <strong>₹{Number(job.budget).toLocaleString('en-IN')}</strong>
                </div>

                <div className="job-card-divider"></div>

                <span className="job-date">
                  Posted{' '}
                  {new Date(job.created_on).toLocaleDateString('en-IN', {
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
