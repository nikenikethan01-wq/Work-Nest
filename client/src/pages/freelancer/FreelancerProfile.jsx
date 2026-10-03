import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faEnvelope,
  faBriefcase,
  faLocationDot,
  faIndianRupeeSign,
  faClock,
} from '@fortawesome/free-solid-svg-icons'

import '../../styles/profile.css'

export default function FreelancerProfile() {
  const { userId } = useParams()

  const [profile, setProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const navigate = useNavigate()

  React.useEffect(() => {
    async function getProfile() {
      try {
        const res = await fetch('/api/freelancer/profile')

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch profile.')
        }

        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [userId])

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to logout.')
      }

      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <p className="profile-message">Loading profile...</p>
  }

  if (error) {
    return <p className="profile-message profile-error">{error}</p>
  }

  return (
    <main className="profile-page">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>View your professional and account information.</p>
      </div>

      <section className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar">
            {profile.name?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <h3>{profile.name}</h3>
            <span>Freelancer</span>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-info-item">
            <FontAwesomeIcon className="profile-info-icon" icon={faUser} />
            <p>{profile.name}</p>
          </div>

          <div className="profile-info-item">
            <FontAwesomeIcon className="profile-info-icon" icon={faEnvelope} />
            <p>{profile.email}</p>
          </div>

          <div className="profile-info-item">
            <FontAwesomeIcon className="profile-info-icon" icon={faBriefcase} />
            <p>{profile.professional_title}</p>
          </div>

          <div className="profile-info-item">
            <FontAwesomeIcon
              className="profile-info-icon"
              icon={faLocationDot}
            />
            <p>{profile.location}</p>
          </div>

          <div className="profile-info-item">
            <FontAwesomeIcon
              className="profile-info-icon"
              icon={faIndianRupeeSign}
            />
            <p>₹{profile.hourly_rate} / hour</p>
          </div>

          <div className="profile-info-item">
            <FontAwesomeIcon className="profile-info-icon" icon={faClock} />
            <p>{profile.experience} years experience</p>
          </div>
        </div>

        <div className="profile-description">
          <div className="profile-description-title">
            <FontAwesomeIcon icon={faBriefcase} />
            <h3>About Me</h3>
          </div>

          <p>{profile.bio}</p>
        </div>

        <button
          type="button"
          className="profile-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </section>
    </main>
  )
}
