// Chat.jsx
import { Outlet, useParams } from 'react-router-dom'
import ConversationList from '../../pages/chat/ConversationsList'
import Conversation from '../../pages/chat/Conversation'
import '../../styles/chat.css'
import React from 'react'

export default function Chat() {
  const { conversationId } = useParams()
  const [windowSize, setWindowSize] = React.useState(window.innerWidth)

  const handleWindowResize = () => {
    setWindowSize(window.innerWidth)
  }

  React.useEffect(() => {
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])
  const isMobile = windowSize < 768

  return (
    <div className="chat-layout">
      <div className="chat-panel">
        {isMobile && conversationId ? (
          <Conversation isMobile={isMobile} />
        ) : (
          <ConversationList />
        )}
      </div>

      {!isMobile && (
        <div className="chat-main">
          <Outlet />
        </div>
      )}
    </div>
  )
}
