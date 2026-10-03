import './jobs.css'
import '../../../styles/filter.css'
import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ClientJobFilters from '../../../components/filters/ClientJobFilters'

export default function ClientJobs() {
  const [jobs, setJobs] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [searchParams] = useSearchParams()
  let filterData = jobs

  React.useEffect(() => {
    const getJobs = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/client/jobs/my`,
          {
            credentials: 'include',
          },
        )
        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
          return
        }

        setJobs(data)
      } catch (err) {
        console.log(err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getJobs()
  }, [])
  // FILTER DATA
  if (!loading && jobs !== null) {
    const sp = new URLSearchParams(searchParams)
    const search = sp.get('search')
    const status = sp.get('status')
    const category = sp.getAll('category')
    if (search !== null) {
      filterData = filterData.filter((job) =>
        job.title.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status !== null) {
      filterData = filterData.filter((job) => job.status === status)
    }

    if (category.length !== 0) {
      filterData = filterData.filter((job) => category.includes(job.category))
    }
  }

  if (loading) {
    return <p className="jobs-message">Loading jobs...</p>
  }

  if (error) {
    return <p className="jobs-message jobs-error">{error}</p>
  }

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div className="jobs-title">
          <h1>My Jobs</h1>
          <p>Manage the jobs you've posted</p>
        </div>

        <Link to="./create" className="post-job-btn">
          <span>+</span>
          Post a Job
        </Link>
      </div>

      <ClientJobFilters />

      <section className="jobs-list">
        {jobs.length === 0 ? (
          <div className="jobs-empty">
            <h2>No jobs at the moment</h2>
            <p>You haven't posted any jobs yet.</p>

            <Link to="./create" className="empty-post-btn">
              + Post a Job
            </Link>
          </div>
        ) : (
          filterData.map((job) => (
            <Link to={`./${job.id}/details`} className="job-card" key={job.id}>
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
          ))
        )}
      </section>
    </div>
  )
}
