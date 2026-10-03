import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Menu from './Menu'
import React from 'react'
import '../../styles/user-layout.css'
import { meContext } from '../authentication/AuthRequired'
import socket from '../../socket/socket'

export default function UserLayout() {
  const { me } = React.useContext(meContext)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <>
      <section className="user-layout">
        <Header userData={me} setMenuOpen={setMenuOpen} />
        <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} userData={me} />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </section>
    </>
  )
}
