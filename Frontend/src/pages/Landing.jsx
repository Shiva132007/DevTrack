import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Role-based dashboards',
    text: 'Admin, manager, and employee views stay focused on the actions that matter for each role.',
  },
  {
    title: 'Live task updates',
    text: 'Socket-powered updates keep work visible without refreshing the page or losing context.',
  },
  {
    title: 'Manager workflow',
    text: 'Create tasks, assign teams, and move work through a clean kanban board with less friction.',
  },
  {
    title: 'Operational oversight',
    text: 'Admin analytics make it easier to track delivery, priority mix, and completion trends.',
  },
];

const steps = [
  'Create a secure account or sign in to an existing workspace.',
  'Land in the right dashboard for your role automatically.',
  'Track work, collaborate in real time, and keep delivery moving.',
];

const Landing = () => {
  return (
    <div className="landing-shell">
      <header className="landing-nav page-shell page-shell--wide" style={{ paddingBottom: 0 }}>
        <div className="navbar__brand">
          <div className="brand-mark">DT</div>
          <div className="navbar__brand-copy">
            <span className="navbar__brand-name">DevTrack</span>
            <span className="navbar__brand-tag">Modern task operations</span>
          </div>
        </div>

        <div className="navbar__meta">
          <Link className="btn btn--ghost" to="/login">Login</Link>
          <Link className="btn btn--primary" to="/register">Register</Link>
        </div>
      </header>

      <main className="page-shell page-shell--wide landing-grid">
        <section className="hero-panel landing-hero">
          <div className="page-header__eyebrow" style={{ color: 'rgba(226, 232, 240, 0.78)' }}>
            Welcome to DevTrack
          </div>
          <h1 className="hero-panel__title">Everything your team needs to plan, assign, and deliver work.</h1>
          <p className="hero-panel__description">
            DevTrack brings together task boards, role-aware dashboards, live updates, and analytics so teams can work with more clarity and less noise.
          </p>

          <div className="hero-panel__meta">
            <span className="badge">Real-time collaboration</span>
            <span className="badge">Role-aware access</span>
            <span className="badge">Analytics-first</span>
          </div>

          <div className="landing-actions">
            <Link className="btn btn--primary" to="/register">Get started</Link>
            <Link className="btn btn--secondary" to="/login">I already have an account</Link>
          </div>
        </section>

        <aside className="panel landing-summary">
          <h2 className="panel__title">What you get</h2>
          <div className="stack">
            {features.map((feature) => (
              <div key={feature.title} className="landing-card">
                <h3 className="landing-card__title">{feature.title}</h3>
                <p className="landing-card__text">{feature.text}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="panel landing-section landing-section--wide">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="page-header__eyebrow">How it works</div>
              <h2 className="panel__title" style={{ marginBottom: 0 }}>A simple path from first visit to daily work</h2>
            </div>
          </div>

          <div className="landing-steps">
            {steps.map((step, index) => (
              <div key={step} className="landing-step">
                <span className="landing-step__number">0{index + 1}</span>
                <p className="landing-step__text">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;