import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'
import FreeancerJobFilter from '../../../components/filters/FreelancerJobFilter'
import './jobs.css'
import getOrCreateConversation from '../../../utils/getOrCreateConversation'

export default function FreelancerJobs() {
  const [jobs, setJobs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  let filterData = jobs

  React.useEffect(() => {
    async function getJobs() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/freelancer/jobs`,
          {
            credentials: 'include',
          },
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch jobs.')
        }

        setJobs(data.jobs)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getJobs()
  }, [])

  if (!loading && jobs !== null) {
    const sp = new URLSearchParams(searchParams)

    const search = sp.get('search')
    const status = sp.get('status')
    const category = sp.getAll('category')
    const minBudget = sp.get('min-budget')
    const maxBudget = sp.get('max-budget')

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

    if (minBudget && maxBudget) {
      filterData = filterData.filter(
        (job) => job.budget >= minBudget && job.budget <= maxBudget,
      )
    } else if (minBudget) {
      filterData = filterData.filter((job) => job.budget >= minBudget)
    } else if (maxBudget) {
      filterData = filterData.filter((job) => job.budget <= maxBudget)
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
    return <p className="jobs-message">Loading jobs...</p>
  }

  if (error) {
    return <p className="jobs-message jobs-error">{error}</p>
  }

  return (
    <main className="jobs-page">
      <div className="jobs-header">
        <h1>Find Jobs</h1>
        <p>Browse available jobs and find your next project.</p>
      </div>

      <FreeancerJobFilter />

      {filterData.length === 0 ? (
        <p className="jobs-message">No jobs are currently available.</p>
      ) : (
        <div className="jobs-grid">
          {filterData.map((job) => (
            <article className="job-tile" key={job.id}>
              <div className="job-tile-header">
                <div>
                  <h2>{job.title}</h2>

                  <span className="job-category">{job.category}</span>
                </div>

                <span className={`job-status ${job.status}`}>
                  <span className="status-dot"></span>
                  {job.status.replace('_', ' ')}
                </span>
              </div>

              <p className="job-description">{job.description}</p>

              <div className="job-tile-info">
                <div>
                  <span>Budget</span>

                  <strong>₹{Number(job.budget).toLocaleString('en-IN')}</strong>
                </div>

                <div>
                  <span>Posted</span>

                  <strong>
                    {new Date(job.created_on).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </strong>
                </div>

                <div>
                  <span>Posted by</span>

                  <div className="job-client">
                    <strong>{job.client_name}</strong>

                    <button
                      type="button"
                      className="job-client-chat"
                      onClick={() => handleMessageClick(job.client_id)}
                      aria-label={`Message ${job.client_name}`}
                      title={`Message ${job.client_name}`}
                    >
                      <FontAwesomeIcon icon={faCommentDots} />
                    </button>
                  </div>
                </div>
              </div>

              <Link
                to={`/freelancer/jobs/${job.id}/apply`}
                className="apply-job-link"
              >
                Apply Job
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
