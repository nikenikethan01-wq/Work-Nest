import './applications.css'
import React from 'react'
import { Link } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileLines } from '@fortawesome/free-solid-svg-icons'

export default function FreelancerApplications() {
  const [applications, setApplications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    async function getApplications() {
      try {
        const res = await fetch('/api/freelancer/applications/my')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Unable to load applications.')
          return
        }

        setApplications(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load applications.')
      } finally {
        setLoading(false)
      }
    }

    getApplications()
  }, [])

  if (loading) {
    return (
      <section className="applications-page">
        <p className="applications-message">Loading applications...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="applications-page">
        <p className="applications-message applications-error">{error}</p>
      </section>
    )
  }

  return (
    <main className="applications-page">
      <Link to="/freelancer" className="back-dashboard-btn">
        <IoArrowBack />
        <span>Back to Dashboard</span>
      </Link>

      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track the applications you have submitted.</p>
      </div>

      {applications.length === 0 ? (
        <div className="applications-page-empty">
          <div className="applications-empty-icon">
            <FontAwesomeIcon icon={faFileLines} />
          </div>

          <h2>No applications yet</h2>

          <p>Applications you submit will appear here.</p>

          <Link to="/freelancer/jobs" className="applications-empty-btn">
            View Jobs
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <Link
              to={`/freelancer/applications/${application.job_id}`}
              className="application-card"
              key={application.job_id}
            >
              <div className="application-card-header">
                <div>
                  <h2 className="application-job-title">
                    {application.job_title}
                  </h2>

                  <span className="application-label">Proposal</span>
                </div>

                <span className={`application-status ${application.status}`}>
                  <span className="status-dot"></span>
                  {application.status.replace('_', ' ')}
                </span>
              </div>

              <p className="application-proposal">{application.proposal}</p>

              <div className="application-divider"></div>

              <div className="application-info">
                <div>
                  <span>Proposed Price</span>

                  <strong>
                    ₹
                    {Number(application.proposal_price).toLocaleString('en-IN')}
                  </strong>
                </div>

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
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
