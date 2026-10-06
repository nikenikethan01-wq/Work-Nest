import './auth.css'
import logo from '../../assets/logo.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faEyeSlash,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import { NavLink } from 'react-router-dom'
import Toast from '../../utils/Toast'
import useRegister from '../../hooks/useRegister'
import AuthLayout from '../../components/layout/AuthLayout'

export default function Register() {
  const {
    handleSubmit,
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    setError,
  } = useRegister()

  return (
    <AuthLayout>
      <section className="auth-card">
        <section className="auth-card">
          <div className="auth-topbar">
            {/* Back */}
            <NavLink to="/login" className="back-link">
              <FontAwesomeIcon icon={faChevronLeft} />
            </NavLink>
            {/* Brand */}
            <div className="auth-brand">
              <div className="brand-logo-mark">
                <img src={logo} alt="WorkNest logo" />
              </div>
              <h1 className="brand-name">
                Work<span>Nest</span>
              </h1>
            </div>
          </div>

          {/* Heading */}
          <div className="auth-header">
            <h2>Create your account</h2>
            <p>Join WorkNest and find the right opportunities</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role */}
            <div className="form-group">
              <span className="role-label">I'm a</span>
              {/* CLIENT ROLE */}
              <div className="role-selector">
                <label
                  className={`role-button ${
                    formData.role === 'client' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={handleChange}
                  />

                  <span>Client</span>
                </label>

                {/* FREELANCER ROLE */}
                <label
                  className={`role-button ${
                    formData.role === 'freelancer' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="freelancer"
                    checked={formData.role === 'freelancer'}
                    onChange={handleChange}
                  />
                  <span>Freelancer</span>
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                Full name
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                Password
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a password"
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
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
              </label>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">
                Confirm password
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                    />
                  </button>
                </div>
              </label>
            </div>

            {/* CLIENT FIELDS */}
            {formData.role === 'client' && (
              <>
                <div className="auth-section-title">
                  <h3>Client information</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Company
                    <input
                      type="text"
                      name="company"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Location
                    <input
                      type="text"
                      name="clientLocation"
                      placeholder="City, Country"
                      value={formData.clientLocation}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Description
                    <textarea
                      name="description"
                      placeholder="Tell us about yourself or your company"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      required
                    />
                  </label>
                </div>
              </>
            )}

            {/* FREELANCER FIELDS */}
            {formData.role === 'freelancer' && (
              <>
                <div className="auth-section-title">
                  <h3>Freelancer information</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Professional title
                    <input
                      type="text"
                      name="professionalTitle"
                      placeholder="e.g. Full Stack Developer"
                      value={formData.professionalTitle}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Skills
                    <input
                      type="text"
                      name="skills"
                      placeholder="React, Node.js, PostgreSQL"
                      value={formData.skills}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Experience
                    <input
                      type="number"
                      name="experience"
                      placeholder="Years of experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Hourly rate
                    <input
                      type="number"
                      name="hourlyRate"
                      placeholder="₹500"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Bio
                    <textarea
                      name="bio"
                      placeholder="Tell clients about yourself"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      required
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Location
                    <input
                      type="text"
                      name="freelancerLocation"
                      placeholder="City, Country"
                      value={formData.freelancerLocation}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>
              </>
            )}

            {/* Submit */}
            <button type="submit" className="btn-primary">
              Create account
            </button>
          </form>

          {/* Footer */}
          <p className="auth-footer">
            Already have an account?
            <NavLink to="/login"> Login</NavLink>
          </p>
          {/* Toast */}
          {error && <Toast message={error} onClose={() => setError('')} />}
        </section>
      </section>
    </AuthLayout>
  )
}
