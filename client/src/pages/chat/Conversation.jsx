import { useParams, Link } from 'react-router-dom'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import socket from '../../socket/socket.js'
import { meContext } from '../../components/authentication/AuthRequired.jsx'
import { OnlineUsersContext } from '../../components/layout/UserLayout.jsx'

export default function Conversation({ isMobile }) {
  const [messages, setMessages] = React.useState([])
  const [userName, setUserName] = React.useState('')
  const [otherUserId, setOtherUserId] = React.useState(null)
  const [inputMessage, setInputMessage] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState(null)
  const onlineUsers = React.useContext(OnlineUsersContext)

  const { me } = React.useContext(meContext)
  const inputRef = React.useRef(null)

  const { conversationId } = useParams()

  React.useEffect(() => {
    const getMessages = async () => {
      try {
        const queryUserName = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/conversations/${conversationId}`,
          {
            credentials: 'include',
          },
        )

        const name = await queryUserName.json()

        if (!queryUserName.ok) {
          setError(name.message)
          return
        }

        if (me.id === name.client_id) {
          setUserName(name.freelancer_name)
          setOtherUserId(name.freelancer_id)
        } else {
          setUserName(name.client_name)
          setOtherUserId(name.client_id)
        }

        const queryDB = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/conversations/${conversationId}/messages`,
          {
            credentials: 'include',
          },
        )

        const data = await queryDB.json()

        if (!queryDB.ok) {
          console.log(data.message)
          setError(data.message)
          return
        }

        setMessages(data)
      } catch (err) {
        console.log(err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getMessages()
  }, [conversationId, me.id])

  function handleSend() {
    const trimmedData = inputMessage.trim()

    if (!trimmedData) return

    setSending(true)

    socket.emit('send-message', {
      conversationId,
      message: trimmedData,
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  function handleInputError(data) {
    setError(data)
    setSending(false)
  }

  function handleAuthenticationError(data) {
    setError(data)
    setSending(false)
  }

  function handleMessageError(data) {
    setError(data)
    setSending(false)
  }

  function handleSuccess(data) {
    setMessages((prev) => [...prev, data])
    setSending(false)
    setInputMessage('')
  }

  function handleNewMessage(data) {
    console.log('CONVERSATION NEW MESSAGE:', data)

    setMessages((prev) => [...prev, data])
  }

  React.useEffect(() => {
    socket.on('input-error', handleInputError)
    socket.on('authentication-error', handleAuthenticationError)
    socket.on('message-error', handleMessageError)
    socket.on('success', handleSuccess)
    socket.on('new-message', handleNewMessage)

    return () => {
      socket.off('input-error', handleInputError)
      socket.off('authentication-error', handleAuthenticationError)
      socket.off('message-error', handleMessageError)
      socket.off('success', handleSuccess)
      socket.off('new-message', handleNewMessage)
    }
  }, [])

  React.useEffect(() => {
    inputRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const isOtherUserOnline =
    otherUserId !== null && Object.hasOwn(onlineUsers, otherUserId)

  if (loading) {
    return <p className="jobs-message">Loading messages...</p>
  }

  return (
    <section className="conversation">
      <header className="conversation-header">
        <div className="conversation-header-user">
          <span
            className={`conversation-status ${
              isOtherUserOnline ? 'online' : 'offline'
            }`}
          />

          <div>
            <strong className="conversation-header-name">{userName}</strong>

            <span className="conversation-header-status">
              {isOtherUserOnline ? 'online' : 'offline'}
            </span>
          </div>
        </div>

        {isMobile && (
          <Link
            to="/chat"
            className="conversation-back"
            aria-label="Back to conversations"
          >
            ×
          </Link>
        )}
      </header>

      {error && <p className="jobs-message jobs-error">{error}</p>}

      <div className="conversation-messages">
        {messages.length === 0 ? (
          <p className="conversation-empty-message">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((message, index) => {
            const isSent = message.sender_id === me.id

            return (
              <div
                ref={messages.length - 1 === index ? inputRef : null}
                className={`message-row ${
                  isSent ? 'message-sent' : 'message-received'
                }`}
                key={message.id}
              >
                <div className="message-content">
                  <p className="message-text">{message.message}</p>

                  <time className="message-time">
                    {new Date(message.sent_on).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="conversation-input-wrapper">
        <input
          type="text"
          onKeyDown={handleKeyDown}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="conversation-input"
        />

        <button
          type="button"
          onClick={handleSend}
          className="conversation-send"
          aria-label="Send message"
          disabled={sending}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </section>
  )
}
