import { Outlet, Navigate } from 'react-router-dom'
import React from 'react'
import { meContext } from './AuthRequired'

export default function FreelancerRequired() {
  const { me } = React.useContext(meContext)

  if (me?.role !== 'freelancer') {
    return <Navigate to="/client" replace />
  }

  return <Outlet />
}
