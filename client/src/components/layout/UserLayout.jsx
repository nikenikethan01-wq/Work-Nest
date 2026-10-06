import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Menu from './Menu'
import React from 'react'
import '../../styles/user-layout.css'
import { meContext } from '../authentication/AuthRequired'
import socket from '../../socket/socket'

export const OnlineUsersContext = React.createContext(null)

export default function UserLayout() {
  const { me } = React.useContext(meContext)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [onlineUsers, setOnlineUsers] = React.useState({})

  function handleOnlineUsers(data) {
    setOnlineUsers(data)
  }

  React.useEffect(() => {
    socket.connect()
    socket.on('online-users', handleOnlineUsers)

    return () => {
      socket.disconnect()
      socket.off('online-users', handleOnlineUsers)
    }
  }, [])

  return (
    <>
      <OnlineUsersContext.Provider value={onlineUsers}>
        <section className="user-layout">
          <Header userData={me} setMenuOpen={setMenuOpen} />
          <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} userData={me} />
          <div className="content">
            <Outlet />
          </div>
          <Footer />
        </section>
      </OnlineUsersContext.Provider>
    </>
  )
}
