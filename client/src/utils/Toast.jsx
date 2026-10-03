import React from 'react'
export default function Toast({ message, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [onClose])
  return (
    <div className={`toast-notification show`} role="alert">
      <span className="toast-message">{message}</span>

      <button
        className="toast-close"
        aria-label="Close notification"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  )
}
