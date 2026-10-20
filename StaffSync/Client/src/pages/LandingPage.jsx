import { Link } from "react-router-dom";
import "./LandingPage.css";

const features = [
  {
    icon: "bi-people",
    title: "Employee Management",
    description:
      "Maintain employee records, manage employee information, and keep your workforce organized.",
    color: "blue",
  },
  {
    icon: "bi-clock-history",
    title: "Attendance Tracking",
    description:
      "Record daily attendance with employee check-in, check-out, and attendance history.",
    color: "green",
  },
  {
    icon: "bi-calendar-check",
    title: "Leave Management",
    description:
      "Submit leave requests, review applications, and track leave decisions in one place.",
    color: "purple",
  },
  {
    icon: "bi-mortarboard",
    title: "Training Programs",
    description:
      "Organize training programs and manage their schedules and completion status.",
    color: "orange",
  },
  {
    icon: "bi-megaphone",
    title: "Announcements",
    description:
      "Provide a central place for important workplace announcements and updates.",
    color: "pink",
  },
  {
    icon: "bi-shield-check",
    title: "Role-Based Access",
    description:
      "Provide separate experiences for HR professionals, managers, and employees.",
    color: "cyan",
  },
];

const roles = [
  {
    number: "01",
    title: "HR Professionals",
    description:
      "Manage employee records, oversee attendance, review leave requests, and coordinate workplace activities.",
    icon: "bi-person-workspace",
  },
  {
    number: "02",
    title: "Managers",
    description:
      "Review leave requests and organize training programs through a dedicated management dashboard.",
    icon: "bi-clipboard-check",
  },
  {
    number: "03",
    title: "Employees",
    description:
      "Access your dashboard, record attendance, submit leave applications, and view request status.",
    icon: "bi-person",
  },
];

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-navbar">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-brand" aria-label="StaffSync home">
            <span className="landing-brand-icon">S</span>

            <span>
              StaffSync
              <small>Modern HR Management</small>
            </span>
          </Link>

          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#roles">User Roles</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-signin">
              Sign In
            </Link>

            <Link to="/register" className="landing-nav-cta">
              Get Started
              <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="landing-hero" id="home">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="landing-eyebrow">
                <span className="landing-eyebrow-dot"></span>
                A smarter way to manage your workforce
              </div>

              <h1>
                People first.
                <br />
                <span>Work made</span>
                <br />
                simpler.
              </h1>

              <p className="landing-hero-description">
                Meet StaffSync — a modern human resource management solution
                that brings employee management, attendance, leave requests,
                and training into one organized workspace.
              </p>

              <div className="landing-hero-actions">
                <Link to="/register" className="landing-primary-button">
                  Get Started
                  <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </Link>

                <Link to="/login" className="landing-secondary-button">
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                  Sign In to StaffSync
                </Link>
              </div>

              <div className="landing-hero-note">
                <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                One workspace for HR, managers, and employees
              </div>
            </div>

            {/* Dashboard-inspired visual built with HTML and CSS */}
            <div className="landing-visual">
              <div className="landing-visual-glow"></div>

              <div className="landing-preview">
                <div className="landing-preview-topbar">
                  <div className="landing-preview-brand">
                    <span className="landing-preview-logo">S</span>
                    <strong>StaffSync</strong>
                  </div>

                  <span className="landing-preview-status">
                    <span></span>
                    Workspace
                  </span>
                </div>

                <div className="landing-preview-body">
                  <div className="landing-preview-welcome">
                    <div>
                      <span>YOUR WORKSPACE</span>
                      <h3>Everything in sync.</h3>
                      <p>A clearer view of everyday work.</p>
                    </div>

                    <div className="landing-preview-welcome-icon">
                      <i className="bi bi-grid-1x2-fill"></i>
                    </div>
                  </div>

                  <div className="landing-preview-section-heading">
                    <div>
                      <strong>Your workspace</strong>
                      <span>Tools for everyday work</span>
                    </div>

                    <i className="bi bi-three-dots"></i>
                  </div>

                  <div className="landing-preview-grid">
                    <div className="landing-preview-card">
                      <span className="preview-card-icon preview-blue">
                        <i className="bi bi-people-fill"></i>
                      </span>
                      <strong>Employees</strong>
                      <small>Employee records</small>
                    </div>

                    <div className="landing-preview-card">
                      <span className="preview-card-icon preview-green">
                        <i className="bi bi-clock-fill"></i>
                      </span>
                      <strong>Attendance</strong>
                      <small>Daily time records</small>
                    </div>

                    <div className="landing-preview-card">
                      <span className="preview-card-icon preview-purple">
                        <i className="bi bi-calendar2-check-fill"></i>
                      </span>
                      <strong>Leave</strong>
                      <small>Requests and status</small>
                    </div>

                    <div className="landing-preview-card">
                      <span className="preview-card-icon preview-orange">
                        <i className="bi bi-mortarboard-fill"></i>
                      </span>
                      <strong>Training</strong>
                      <small>Learning programs</small>
                    </div>
                  </div>

                  <div className="landing-preview-bottom">
                    <div className="landing-preview-bottom-icon">
                      <i className="bi bi-shield-lock-fill"></i>
                    </div>

                    <div>
                      <strong>Designed around your role</strong>
                      <span>HR · Manager · Employee</span>
                    </div>

                    <i className="bi bi-arrow-up-right"></i>
                  </div>
                </div>
              </div>

              <div className="landing-floating-card landing-floating-top">
                <span className="landing-floating-icon green">
                  <i className="bi bi-check-lg"></i>
                </span>
                <div>
                  <strong>Work organized</strong>
                  <small>All in one place</small>
                </div>
              </div>

              <div className="landing-floating-card landing-floating-bottom">
                <span className="landing-floating-icon purple">
                  <i className="bi bi-people-fill"></i>
                </span>
                <div>
                  <strong>People connected</strong>
                  <small>One shared workspace</small>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-hero-bottom">
            <div className="landing-container landing-hero-bottom-inner">
              <span>BUILT FOR THE WAY TEAMS WORK</span>

              <div>
                <span>
                  <i className="bi bi-person-workspace"></i> HR
                </span>
                <span>
                  <i className="bi bi-clipboard-check"></i> Managers
                </span>
                <span>
                  <i className="bi bi-person-check"></i> Employees
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="landing-section" id="features">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span className="landing-section-label">WHAT STAFFSYNC OFFERS</span>

              <h2>
                The essentials of HR,
                <br />
                <span>all in one place.</span>
              </h2>

              <p>
                Bring important workforce activities together in one organized
                system, with tools designed around your team's responsibilities.
              </p>
            </div>

            <div className="landing-features-grid">
              {features.map((feature) => (
                <article className="landing-feature-card" key={feature.title}>
                  <div className={`landing-feature-icon ${feature.color}`}>
                    <i className={`bi ${feature.icon}`} aria-hidden="true"></i>
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>

                  <span className="landing-feature-arrow" aria-hidden="true">
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="landing-process-section" id="how-it-works">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span className="landing-section-label">HOW IT WORKS</span>

              <h2>
                A clearer workflow.
                <br />
                <span>A more organized team.</span>
              </h2>

              <p>
                StaffSync brings everyday HR activities into a straightforward
                workflow for the people responsible for them.
              </p>
            </div>

            <div className="landing-process-grid">
              <article className="landing-process-card">
                <span className="landing-process-number">01</span>
                <div className="landing-process-icon">
                  <i className="bi bi-person-plus"></i>
                </div>
                <h3>Access your workspace</h3>
                <p>
                  Sign in to your account and open the dashboard associated
                  with your role.
                </p>
              </article>

              <div className="landing-process-connector">
                <i className="bi bi-arrow-right"></i>
              </div>

              <article className="landing-process-card">
                <span className="landing-process-number">02</span>
                <div className="landing-process-icon">
                  <i className="bi bi-layout-text-window"></i>
                </div>
                <h3>Manage daily activities</h3>
                <p>
                  Use the available tools for employee records, attendance,
                  leave requests, or training.
                </p>
              </article>

              <div className="landing-process-connector">
                <i className="bi bi-arrow-right"></i>
              </div>

              <article className="landing-process-card">
                <span className="landing-process-number">03</span>
                <div className="landing-process-icon">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <h3>Keep work organized</h3>
                <p>
                  Track relevant information and follow the status of activities
                  from the appropriate dashboard.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="landing-section landing-roles-section" id="roles">
          <div className="landing-container">
            <div className="landing-roles-heading">
              <div className="landing-section-heading">
                <span className="landing-section-label">ONE PLATFORM, THREE ROLES</span>

                <h2>
                  The right tools
                  <br />
                  <span>for every role.</span>
                </h2>
              </div>

              <p>
                Each role has its own dashboard and access to the functions
                relevant to its responsibilities.
              </p>
            </div>

            <div className="landing-roles-grid">
              {roles.map((role) => (
                <article className="landing-role-card" key={role.number}>
                  <div className="landing-role-top">
                    <span className="landing-role-number">{role.number}</span>
                    <i className={`bi ${role.icon}`} aria-hidden="true"></i>
                  </div>

                  <h3>{role.title}</h3>
                  <p>{role.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="landing-cta-section">
          <div className="landing-container">
            <div className="landing-cta-panel">
              <div className="landing-cta-decoration landing-cta-decoration-one"></div>
              <div className="landing-cta-decoration landing-cta-decoration-two"></div>

              <div className="landing-cta-content">
                <span className="landing-section-label">
                  BRING YOUR WORK TOGETHER
                </span>

                <h2>
                  Make everyday work
                  <br />
                  <span>feel more organized.</span>
                </h2>

                <p>
                  Explore a more structured way to manage workforce activities
                  with StaffSync.
                </p>

                <div className="landing-cta-actions">
                  <Link to="/register" className="landing-cta-white-button">
                    Create an account
                    <i className="bi bi-arrow-right"></i>
                  </Link>

                  <Link to="/login" className="landing-cta-text-link">
                    Already registered? Sign in
                  </Link>
                </div>
              </div>

              <div className="landing-cta-symbol" aria-hidden="true">
                <div className="landing-cta-symbol-inner">
                  <i className="bi bi-people-fill"></i>
                </div>
                <span className="landing-cta-orbit orbit-one"></span>
                <span className="landing-cta-orbit orbit-two"></span>
                <span className="landing-cta-orbit orbit-three"></span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-main">
            <Link to="/" className="landing-brand landing-footer-brand">
              <span className="landing-brand-icon">S</span>
              <span>
                StaffSync
                <small>Modern HR Management</small>
              </span>
            </Link>

            <p>
              A modern human resource management solution for organized
              workforce operations.
            </p>

            <div className="landing-footer-links">
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Get Started</Link>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <span>
              © {new Date().getFullYear()} StaffSync — Modern Human Resource
              Management Solution
            </span>

            <a href="#home">
              Back to top <i className="bi bi-arrow-up"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;