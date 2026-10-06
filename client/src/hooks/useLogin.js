import React from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../socket/socket'
export default function useLogin(setLoading) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({ email: '', password: '' })
  const [error, setError] = React.useState('')
  const navigate = useNavigate()
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = formData.email.trim()
    const password = formData.password
    try {
      setLoading((prev) => !prev)
      if (!email || typeof email !== 'string' || !password) {
        throw new Error('Field is empty or invalid format.')
      }
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        },
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      if (data?.role === 'client') {
        socket.connect()
        navigate('/client')
      } else if (data?.role === 'freelancer') {
        socket.connect()
        navigate('/freelancer')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading((prev) => !prev)
    }
  }
  return {
    handleSubmit,
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    error,
    setError,
  }
}
