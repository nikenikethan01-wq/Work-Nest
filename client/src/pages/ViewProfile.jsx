import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faCircleUser } from '@fortawesome/free-regular-svg-icons'
import '../styles/view-profile.css'
import getOrCreateConversation from '../utils/getOrCreateConversation'

export default function ViewProfile() {
  const { userId } = useParams()

  const [profile, setProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const navigate = useNavigate()

  const isFreelancerProfile = window.location.pathname.includes('/freelancers/')

  React.useEffect(() => {
    async function getProfile() {
      try {
        const endpoint = isFreelancerProfile
          ? `${import.meta.env.VITE_API_URL}/api/client/freelancers/${userId}`
          : `${import.meta.env.VITE_API_URL}/api/freelancer/clients/${userId}`

        const res = await fetch(endpoint, {
          credentials: 'include',
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load profile.')
        }
        const dataType = isFreelancerProfile ? data.freelancer : data.client
        setProfile(dataType)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [userId, isFreelancerProfile])

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
    return <p className="profile-message">Loading profile...</p>
  }

  if (error) {
    return <p className="profile-message profile-error">{error}</p>
  }

  if (!profile) {
    return <p className="profile-message">Profile not found.</p>
  }

  return (
    <div className="view-profile">
      <div className="view-profile-header">
        <div className="profile-identity">
          <FontAwesomeIcon icon={faCircleUser} />

          <div>
            <h1>{profile.name}</h1>

            {isFreelancerProfile ? (
              <p className="profile-role">{profile.professional_title}</p>
            ) : (
              <p className="profile-role">{profile.company}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="profile-chat-btn"
          onClick={() => handleMessageClick(profile.id)}
          aria-label={`Chat with ${profile.name}`}
          title={`Chat with ${profile.name}`}
        >
          <FontAwesomeIcon icon={faComment} />
        </button>
      </div>

      {isFreelancerProfile ? (
        <>
          <section className="profile-section">
            <h2>About</h2>
            <p>{profile.bio || 'No bio available.'}</p>
          </section>

          <section className="profile-section">
            <h2>Skills</h2>
            <p>{profile.skills}</p>
          </section>

          <section className="profile-details">
            <div>
              <span>Experience</span>
              <strong>{profile.experience} years</strong>
            </div>

            <div>
              <span>Hourly Rate</span>
              <strong>₹{profile.hourly_rate}</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>{profile.location}</strong>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="profile-section">
            <h2>About</h2>
            <p>{profile.description || 'No description available.'}</p>
          </section>

          <section className="profile-details">
            <div>
              <span>Company</span>
              <strong>{profile.company}</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>{profile.location}</strong>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
