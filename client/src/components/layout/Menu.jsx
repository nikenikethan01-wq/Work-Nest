import { NavLink, Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import React from 'react'

export default function Menu({ menuOpen, setMenuOpen, userData }) {
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  const menuItems =
    userData.role === 'client'
      ? [
          { name: 'Dashboard', path: '/client' },
          { name: 'Jobs', path: '/client/jobs' },
          { name: 'Applications', path: '/client/applications' },
          { name: 'Projects', path: '/client/projects' },
        ]
      : [
          { name: 'Dashboard', path: '/freelancer' },
          { name: 'Find Jobs', path: '/freelancer/jobs' },
          { name: 'Applications', path: '/freelancer/applications' },
          { name: 'Projects', path: '/freelancer/projects' },
        ]

  async function handleLogout() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {
          method: 'POST',
          credentials: 'include',
        },
      )

      if (!res.ok) {
        throw new Error('Failed to logout.')
      }

      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) {
    return <p className="profile-message profile-error">{error}</p>
  }

  return (
    <>
      {menuOpen && (
        <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <div className="auth-brand">
            <Link to={`/${userData.role}`}>
              <h1 className="brand-name">
                Work<span>Nest</span>
              </h1>
            </Link>
          </div>

          <button
            type="button"
            className="menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink end to={item.path} onClick={() => setMenuOpen(false)}>
                {item.name}
              </NavLink>
            </li>
          ))}

          <li>
            <Link
              to={`/${userData.role}/profile/${userData.id}`}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          </li>

          <li>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </>
  )
}
