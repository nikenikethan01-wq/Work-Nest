import React from 'react'
import validateRegisterForm from '../utils/validateRegisterForm'
import { useNavigate } from 'react-router-dom'
export default function useRegister() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  const [formData, setFormData] = React.useState({
    role: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Client
    company: '',
    clientLocation: '',
    description: '',

    // Freelancer
    professionalTitle: '',
    skills: '',
    experience: '',
    hourlyRate: '',
    bio: '',
    freelancerLocation: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = validateRegisterForm(formData)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }
      navigate('/login')
      return
    } catch (err) {
      setError(err.message)
    }
  }

  return {
    handleSubmit,
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    setError,
  }
}
