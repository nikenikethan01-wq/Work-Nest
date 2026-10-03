import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'

export const meContext = React.createContext(null)

export default function AuthRequired() {
  const [me, setMe] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const getMe = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()

        if (!res.ok) {
          setMe(null)
          return
        }

        setMe(data)
      } catch (err) {
        console.log(err)
        setMe(null)
      } finally {
        setLoading(false)
      }
    }

    getMe()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (!me?.role) {
    return <Navigate to="/login" replace />
  }

  return (
    <meContext.Provider value={{ me, setMe }}>
      <Outlet />
    </meContext.Provider>
  )
}
