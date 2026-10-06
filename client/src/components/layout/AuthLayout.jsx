import './auth.css'
import heroImage from '../../assets/auth-hero.svg'
export default function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <aside
        className="auth-visual"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="auth-visual-overlay">
          <p className="auth-visual-title">Find work. Hire talent.</p>
          <p className="auth-visual-text">
            Post jobs, chat with freelancers, and get projects done in one
            place.
          </p>
        </div>
      </aside>

      <div className="auth-panel">{children}</div>
    </main>
  )
}
