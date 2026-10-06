import { NavLink } from 'react-router-dom'
import React from 'react'
import socket from '../../socket/socket'
import { OnlineUsersContext } from '../../components/layout/UserLayout'

export default function ConversationList() {
  const [messagesList, setMessagesList] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const onlineUsers = React.userContext(OnlineUsersContext)

  function handleNewMessage(data) {
    setMessagesList((prev) => {
      const itemExists = prev.findIndex(
        (el) => el.conversation_id === data.conversation_id,
      )

      if (itemExists !== -1) {
        return prev.map((el) =>
          el.conversation_id === data.conversation_id
            ? {
                ...el,
                message: data.message,
              }
            : el,
        )
      }

      return [
        ...prev,
        {
          ...data,
          other_user_id: data.sender_id,
          other_user_name: data.name,
        },
      ]
    })
  }

  React.useEffect(() => {
    const getMessageList = async () => {
      try {
        const queryDB = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/conversations`,
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

        setMessagesList(data)
      } catch (err) {
        console.log(err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getMessageList()

    socket.on('new-message', handleNewMessage)

    return () => {
      socket.off('new-message', handleNewMessage)
    }
  }, [])

  if (loading) {
    return <p className="jobs-message">Loading conversations...</p>
  }

  if (error) {
    return <p className="jobs-message jobs-error">{error}</p>
  }

  return (
    <section className="conversation-list">
      <div className="conversation-list-header">
        <h1 className="conversation-list-title">Messages</h1>
      </div>

      <div className="conversation-items">
        {messagesList.length === 0 ? (
          <div className="conversation-empty-list">
            <p>No conversations yet.</p>

            <button type="button">Start a conversation</button>
          </div>
        ) : (
          messagesList.map((message) => {
            const isOnline = Object.hasOwn(onlineUsers, message.other_user_id)

            return (
              <NavLink
                to={`/chat/${message.conversation_id}`}
                className="conversation-item"
                key={message.conversation_id}
              >
                <div className="conversation-user">
                  <span
                    className={`conversation-status ${
                      isOnline ? 'online' : 'offline'
                    }`}
                  />

                  <strong className="conversation-user-name">
                    {message.other_user_name}
                  </strong>
                </div>

                <p className="conversation-last-message">{message.message}</p>
              </NavLink>
            )
          })
        )}
      </div>
    </section>
  )
}
