import './create-update.css'
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import validateCreateJobData from '../../../utils/validateCreateJobData'

export default function ClientUpdateJob() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    status: '',
  })

  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  React.useEffect(() => {
    async function getJob() {
      try {
        console.log(jobId)
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/client/jobs/${jobId}`,
          {
            credentials: 'include',
          },
        )
        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
          return
        }
        console.log(data)
        setFormData({
          title: data.title,
          description: data.description,
          budget: data.budget,
          category: data.category,
          status: data.status,
        })
      } catch (err) {
        console.log(err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getJob()
  }, [jobId])

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      const cleanedData = validateCreateJobData(formData)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/client/jobs/${jobId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedData),
        },
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess(data.message)

      setTimeout(() => {
        navigate(`/client/jobs/${jobId}/details`)
      }, 700)
    } catch (err) {
      console.log(err.message)
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <p className="jobs-message">Loading job...</p>
  }

  return (
    <div className="job-form-page">
      <div className="job-form-header">
        <Link to={`/client/jobs/${jobId}/details`} className="back-link">
          ← Back to Job
        </Link>

        <h1>Edit Job</h1>
        <p>Update the details of your job.</p>
      </div>

      <form className="job-form" onSubmit={handleSubmit}>
        <div className="job-form-field">
          <label htmlFor="title">Job title</label>

          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. React Developer Needed"
          />
        </div>

        <div className="job-form-field">
          <label htmlFor="category">Category</label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Graphic Design">Graphic Design</option>
          </select>
        </div>

        <div className="job-form-field">
          <label htmlFor="budget">Budget</label>

          <div className="budget-input">
            <span>₹</span>

            <input
              id="budget"
              name="budget"
              type="number"
              min="1"
              value={formData.budget}
              onChange={handleChange}
              placeholder="50000"
            />
          </div>
        </div>

        <div className="job-form-field">
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            name="description"
            rows="7"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the work, requirements, and expectations..."
          />
        </div>

        {error && <p className="job-form-message job-form-error">{error}</p>}

        {success && (
          <p className="job-form-message job-form-success">{success}</p>
        )}

        <button type="submit" className="job-form-btn" disabled={updating}>
          {updating ? 'Updating...' : 'Update Job'}
        </button>
      </form>
    </div>
  )
}
