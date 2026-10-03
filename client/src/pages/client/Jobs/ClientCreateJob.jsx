import './create-update.css'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import validateCreateJobData from '../../../utils/validateCreateJobData'

export default function ClientCreateJob() {
  const navigate = useNavigate()

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    status: 'live',
  })

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const cleanedData = validateCreateJobData(formData)

      const res = await fetch('/api/client/jobs/createjob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess(data.message)

      setTimeout(() => {
        navigate('/client/jobs')
      }, 700)
    } catch (err) {
      console.log(err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="job-form-page">
      <div className="job-form-header">
        <Link to=".." relative="path" className="back-link">
          ← Back to Jobs
        </Link>

        <h1>Create a Job</h1>
        <p>Tell freelancers what you need.</p>
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

        <button type="submit" className="job-form-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Post Job'}
        </button>
      </form>
    </div>
  )
}
