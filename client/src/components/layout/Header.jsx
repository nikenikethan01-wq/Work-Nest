import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { faBell, faUser, faComments } from '@fortawesome/free-regular-svg-icons'
import { Link } from 'react-router-dom'

export default function Header({ userData, setMenuOpen }) {
  return (
    <header className="site-header">
      <div className="header-left">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className="header-actions">
        <Link
          to="#"
          className="profile-btn notification-btn"
          aria-label="Notifications"
        >
          <FontAwesomeIcon icon={faBell} />
        </Link>

        <Link to="/chat" className="profile-btn chat-btn" aria-label="Chat">
          <FontAwesomeIcon icon={faComments} />
        </Link>

        <Link
          to={`/${userData.role}/profile/${userData.id}`}
          className="profile-btn profile-action-btn"
          aria-label="Profile"
        >
          <FontAwesomeIcon icon={faUser} />
        </Link>
      </div>
    </header>
  )
}
