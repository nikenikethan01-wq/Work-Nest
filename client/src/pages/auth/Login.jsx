import './auth.css'
import useLogin from '../../hooks/useLogin'
import logo from '../../assets/logo.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom'
import Toast from '../../utils/Toast'
import AuthLayout from '../../components/layout/AuthLayout'
import React from 'react'
export default function Login() {
  const [loading, setLoading] = React.useState(false)
  const {
    handleSubmit,
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    error,
    setError,
  } = useLogin(setLoading)
  return (
    <AuthLayout>
      <section className="auth-card">
        <section className="auth-card">
          <div className="auth-brand">
            <div className="brand-logo-mark">
              <img src={logo} alt="WorkNest logo" />
            </div>
            <h1 className="brand-name">
              Work<span>Nest</span>
            </h1>
          </div>

          {/* Form Heading */}
          <div className="auth-header">
            <h2>Welcome back!</h2>
            <p>Login to your account</p>
          </div>

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                Password
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <FontAwesomeIcon icon={faEye} />
                    ) : (
                      <FontAwesomeIcon icon={faEyeSlash} />
                    )}
                  </button>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in' : 'Login'}
            </button>

            {/* Forgot Password Link */}
            <a href="" className="forgot-link">
              Forgot password?
            </a>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Form Footer */}
          <p className="auth-footer">
            Don't have an account?
            <NavLink to="/register"> Sign up</NavLink>
          </p>
          {/* Toast Message */}
          {error && <Toast message={error} onClose={() => setError('')} />}
        </section>
      </section>
    </AuthLayout>
  )
}
