import { Outlet, Navigate } from 'react-router-dom'
import { meContext } from './AuthRequired'
import React from 'react'

export default function ClientRequired() {
  const { me } = React.useContext(meContext)

  if (me?.role !== 'client') {
    return <Navigate to="/freelancer" replace />
  }

  return <Outlet />
}
