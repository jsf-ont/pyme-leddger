import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calculator, 
  TrendingDown, 
  Wallet, 
  Shield, 
  Zap, 
  Check,
  ChevronRight,
  ArrowRight,
  Star,
  Users,
  Briefcase,
  FileText,
  Building2,
  CreditCard,
  PiggyBank,
  Menu,
  X
} from 'lucide-react'

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="landing">
      <style>{`
        .landing {
          --emerald: #0D5C4A;
          --emerald-dark: #094539;
          --emerald-light: #1A7A62;
          --cream: #F5F0E8;
          --cream-dark: #E8E0D4;
          --amber: #D4A853;
          --amber-light: #E8C97A;
          --charcoal: #1A1A1A;
          --slate: #4A4A4A;
          --white: #FFFFFF;
        }

        .landing * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--cream);
          color: var(--charcoal);
          line-height: 1.6;
        }

        .landing .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Navigation */
        .landing .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(245, 240, 232, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .landing .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .landing .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .landing .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--emerald), var(--amber));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          color: white;
        }

        .landing .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--emerald);
        }

        .landing .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }

        .landing .nav-links a {
          text-decoration: none;
          color: var(--slate);
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .landing .nav-links a:hover {
          color: var(--emerald);
        }

        .landing .nav-buttons {
          display: flex;
          gap: 12px;
        }

        .landing .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          font-family: inherit;
        }

        .landing .btn-ghost {
          background: transparent;
          color: var(--emerald);
        }

        .landing .btn-ghost:hover {
          background: rgba(13, 92, 74, 0.05);
        }

        .landing .btn-primary {
          background: var(--emerald);
          color: white;
        }

        .landing .btn-primary:hover {
          background: var(--emerald-dark);
          transform: translateY(-1px);
        }

        .landing .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        /* Hero */
        .landing .hero {
          padding: 160px 0 100px;
          background: linear-gradient(180deg, var(--cream) 0%, var(--cream-dark) 100%);
          position: relative;
          overflow: hidden;
        }

        .landing .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(13, 92, 74, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .landing .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .landing .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--emerald);
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .landing .hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          color: var(--charcoal);
          margin-bottom: 24px;
        }

        .landing .hero h1 span {
          color: var(--emerald);
        }

        .landing .hero-subtitle {
          font-size: 1.15rem;
          color: var(--slate);
          margin-bottom: 32px;
          max-width: 480px;
        }

        .landing .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .landing .btn-large {
          padding: 14px 28px;
          font-size: 1rem;
        }

        .landing .hero-stats {
          display: flex;
          gap: 40px;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }

        .landing .stat {
          text-align: left;
        }

        .landing .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--emerald);
        }

        .landing .stat-label {
          font-size: 0.85rem;
          color: var(--slate);
        }

        .landing .hero-visual {
          position: relative;
        }

        .landing .dashboard-preview {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          overflow: hidden;
          transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
          transition: transform 0.5s;
        }

        .landing .dashboard-preview:hover {
          transform: perspective(1000px) rotateY(0) rotateX(0);
        }

        .landing .dashboard-header {
          background: var(--emerald);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .landing .dashboard-dots {
          display: flex;
          gap: 6px;
        }

        .landing .dashboard-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .landing .dashboard-dot:nth-child(1) { background: #ff5f57; }
        .landing .dashboard-dot:nth-child(2) { background: #febc2e; }
        .landing .dashboard-dot:nth-child(3) { background: #28c840; }

        .landing .dashboard-body {
          padding: 24px;
        }

        .landing .preview-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .landing .preview-card {
          background: var(--cream);
          padding: 16px;
          border-radius: 10px;
        }

        .landing .preview-card-label {
          font-size: 0.75rem;
          color: var(--slate);
          margin-bottom: 4px;
        }

        .landing .preview-card-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--emerald);
        }

        /* Problem Section */
        .landing .problem {
          padding: 100px 0;
          background: white;
        }

        .landing .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 60px;
        }

        .landing .section-label {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--amber);
          margin-bottom: 16px;
        }

        .landing .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 700;
          color: var(--charcoal);
          margin-bottom: 16px;
        }

        .landing .section-subtitle {
          font-size: 1.1rem;
          color: var(--slate);
        }

        .landing .problem-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .landing .problem-card {
          padding: 32px;
          background: var(--cream);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s;
        }

        .landing .problem-card:hover {
          transform: translateY(-4px);
        }

        .landing .problem-icon {
          width: 64px;
          height: 64px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: var(--emerald);
        }

        .landing .problem-card h3 {
          font-size: 1.1rem;
          margin-bottom: 12px;
          color: var(--charcoal);
        }

        .landing .problem-card p {
          font-size: 0.95rem;
          color: var(--slate);
        }

        .landing .stat-highlight {
          background: linear-gradient(135deg, var(--emerald), var(--emerald-light));
          color: white;
          padding: 60px 0;
        }

        .landing .stat-banner {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 80px;
        }

        .landing .stat-banner-item {
          text-align: center;
        }

        .landing .stat-banner-value {
          font-family: 'Syne', sans-serif;
          font-size: 4rem;
          font-weight: 800;
        }

        .landing .stat-banner-label {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        /* Solution */
        .landing .solution {
          padding: 100px 0;
          background: var(--cream);
        }

        .landing .solution-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 48px;
        }

        .landing .solution-features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .landing .solution-feature {
          display: flex;
          gap: 16px;
          padding: 24px;
          background: white;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .landing .solution-feature:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .landing .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(13, 92, 74, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--emerald);
          flex-shrink: 0;
        }

        .landing .feature-content h3 {
          font-size: 1.05rem;
          margin-bottom: 6px;
        }

        .landing .feature-content p {
          font-size: 0.9rem;
          color: var(--slate);
        }

        .landing .solution-visual {
          background: var(--emerald);
          border-radius: 20px;
          padding: 40px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .landing .solution-visual h3 {
          font-size: 1.5rem;
          margin-bottom: 24px;
        }

        .landing .pcge-list {
          list-style: none;
        }

        .landing .pcge-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .landing .pcge-list li:last-child {
          border-bottom: none;
        }

        .landing .pcge-list svg {
          color: var(--amber);
        }

        /* Pricing */
        .landing .pricing {
          padding: 100px 0;
          background: white;
        }

        .landing .pricing-grid {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .landing .pricing-card {
          background: var(--cream);
          border-radius: 20px;
          padding: 40px;
          width: 380px;
          text-align: center;
          transition: all 0.3s;
          position: relative;
        }

        .landing .pricing-card.featured {
          background: var(--emerald);
          color: white;
          transform: scale(1.05);
        }

        .landing .pricing-card.featured .pricing-price,
        .landing .pricing-card.featured .pricing-period {
          color: white;
        }

        .landing .pricing-card.featured .pricing-features {
          color: rgba(255,255,255,0.9);
        }

        .landing .pricing-card.featured .pricing-features svg {
          color: var(--amber);
        }

        .landing .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--amber);
          color: var(--charcoal);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .landing .pricing-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .landing .pricing-desc {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 24px;
        }

        .landing .pricing-price {
          font-family: 'Syne', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          color: var(--emerald);
        }

        .landing .pricing-period {
          font-size: 1rem;
          color: var(--slate);
          margin-bottom: 32px;
        }

        .landing .pricing-features {
          text-align: left;
          margin-bottom: 32px;
          color: var(--slate);
        }

        .landing .pricing-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          font-size: 0.95rem;
        }

        .landing .btn-full {
          width: 100%;
          justify-content: center;
        }

        .landing .btn-white {
          background: white;
          color: var(--emerald);
        }

        /* Testimonials */
        .landing .testimonials {
          padding: 100px 0;
          background: var(--cream);
        }

        .landing .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .landing .testimonial-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
        }

        .landing .testimonial-stars {
          display: flex;
          gap: 4px;
          color: var(--amber);
          margin-bottom: 16px;
        }

        .landing .testimonial-text {
          font-size: 1rem;
          color: var(--slate);
          margin-bottom: 24px;
          line-height: 1.7;
        }

        .landing .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .landing .author-avatar {
          width: 48px;
          height: 48px;
          background: var(--emerald);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }

        .landing .author-name {
          font-weight: 600;
        }

        .landing .author-role {
          font-size: 0.85rem;
          color: var(--slate);
        }

        /* CTA */
        .landing .cta {
          padding: 100px 0;
          background: var(--emerald);
          text-align: center;
          color: white;
        }

        .landing .cta h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 16px;
        }

        .landing .cta p {
          font-size: 1.15rem;
          opacity: 0.9;
          margin-bottom: 32px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .landing .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        /* Footer */
        .landing .footer {
          padding: 60px 0 30px;
          background: var(--charcoal);
          color: white;
        }

        .landing .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        .landing .footer-brand p {
          font-size: 0.95rem;
          opacity: 0.7;
          margin-top: 16px;
          max-width: 280px;
        }

        .landing .footer-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
          color: rgba(255,255,255,0.5);
        }

        .landing .footer-links {
          list-style: none;
        }

        .landing .footer-links li {
          margin-bottom: 12px;
        }

        .landing .footer-links a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .landing .footer-links a:hover {
          color: var(--amber);
        }

        .landing .footer-bottom {
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.6;
        }

        /* Mobile */
        @media (max-width: 900px) {
          .landing .nav-links, .landing .nav-buttons {
            display: none;
          }

          .landing .mobile-menu-btn {
            display: block;
          }

          .landing .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .landing .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }

          .landing .hero-buttons {
            justify-content: center;
          }

          .landing .hero-stats {
            justify-content: center;
          }

          .landing .hero-visual {
            display: none;
          }

          .landing .problem-grid,
          .landing .testimonial-grid {
            grid-template-columns: 1fr;
          }

          .landing .solution-grid {
            grid-template-columns: 1fr;
          }

          .landing .solution-visual {
            order: -1;
          }

          .landing .pricing-card.featured {
            transform: none;
          }

          .landing .footer-grid {
            grid-template-columns: 1fr 1fr;
          }

          .landing .stat-banner {
            flex-direction: column;
            gap: 32px;
          }
        }
      `}</style>

      <nav className="nav">
        <div className="container nav-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">₿</div>
            <span className="logo-text">BeanPCGE</span>
          </Link>
          
          <ul className="nav-links">
            <li><a href="#features">Características</a></li>
            <li><a href="#pricing">Precios</a></li>
            <li><a href="#testimonials">Testimonios</a></li>
          </ul>

          <div className="nav-buttons">
            <Link to="/login" className="btn btn-ghost">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary">Empezar Gratis</Link>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Zap size={16} />
              Contabilidad simplificada para MYPEs
            </div>
            <h1>Contabilidad <span>Profesional</span> para MYPEs Peruanas</h1>
            <p className="hero-subtitle">
              El软件 de contabilidad que entiende el PCGE. Olvídate de los errores 
              contables y enfócate en hacer crecer tu negocio.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Empezar Gratis <ArrowRight size={18} />
              </Link>
              <Link to="/demo" className="btn btn-ghost btn-large">
                Ver Demo
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-value">S/50</div>
                <div className="stat-label">por mes</div>
              </div>
              <div className="stat">
                <div className="stat-value">100%</div>
                <div className="stat-label">PCGE Peruano</div>
              </div>
              <div className="stat">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Soporte</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="dashboard-header">
                <div className="dashboard-dots">
                  <span className="dashboard-dot"></span>
                  <span className="dashboard-dot"></span>
                  <span className="dashboard-dot"></span>
                </div>
              </div>
              <div className="dashboard-body">
                <div className="preview-cards">
                  <div className="preview-card">
                    <div className="preview-card-label">Ingresos del Mes</div>
                    <div className="preview-card-value">S/ 45,000</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card-label">Gastos del Mes</div>
                    <div className="preview-card-value">S/ 32,000</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card-label">Ganancia Neta</div>
                    <div className="preview-card-value">S/ 13,000</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card-label">Para SUNAT</div>
                    <div className="preview-card-value">S/ 3,900</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problem">
        <div className="container">
          <div className="section-header">
            <span className="section-label">El Problema</span>
            <h2 className="section-title">¿Por qué fracasan las MYPEs?</h2>
            <p className="section-subtitle">
              La falta de control financiero es el principal motivo de cierre 
              de pequeños negocios en el Perú.
            </p>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">
                <TrendingDown size={28} />
              </div>
              <h3>4 de 10 MYPEs fracasan</h3>
              <p>Por falta de control financiero y contabilidad deficiente</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">
                <Wallet size={28} />
              </div>
              <h3>Contadores costosos</h3>
              <p>Un contador profesional puede costar desde S/700 mensuales</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">
                <Calculator size={28} />
              </div>
              <h3>Software complejo</h3>
              <p>Los sistemas actuales son difíciles de usar para emprendedores</p>
            </div>
          </div>
        </div>
      </section>

      <div className="stat-highlight">
        <div className="container stat-banner">
          <div className="stat-banner-item">
            <div className="stat-banner-value">40%</div>
            <div className="stat-banner-label">de MYPEs cierran por falta de control</div>
          </div>
          <div className="stat-banner-item">
            <div className="stat-banner-value">S/700</div>
            <div className="stat-banner-label">cuesta un contador en promedio</div>
          </div>
          <div className="stat-banner-item">
            <div className="stat-banner-value">90%</div>
            <div className="stat-banner-label">ahorra con BeanPCGE</div>
          </div>
        </div>
      </div>

      <section className="solution" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-label">La Solución</span>
            <h2 className="section-title">Contabilidad diseñada para emprendedores</h2>
            <p className="section-subtitle">
              BeanPCGE combina la potencia de Beancount con el estándar contable peruano.
            </p>
          </div>
          <div className="solution-grid">
            <div className="solution-features">
              <div className="solution-feature">
                <div className="feature-icon">
                  <Calculator size={24} />
                </div>
                <div className="feature-content">
                  <h3>100% PCGE Peruano</h3>
                  <p>Cuentas preconfiguradas según el Plan Contable General Empresarial</p>
                </div>
              </div>
              <div className="solution-feature">
                <div className="feature-icon">
                  <Zap size={24} />
                </div>
                <div className="feature-content">
                  <h3>Inteligencia Artificial</h3>
                  <p>Describe tus transacciones en lenguaje natural y nosotros las categorizamos</p>
                </div>
              </div>
              <div className="solution-feature">
                <div className="feature-icon">
                  <FileText size={24} />
                </div>
                <div className="feature-content">
                  <h3>Reportes Instantáneos</h3>
                  <p>Balance General y Estado de Resultados en un clic</p>
                </div>
              </div>
              <div className="solution-feature">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <div className="feature-content">
                  <h3>Compatible con SUNAT</h3>
                  <p>Genera reportes listos para tus declaraciones tributarias</p>
                </div>
              </div>
            </div>
            <div className="solution-visual">
              <h3>Plan de Cuentas PCGE</h3>
              <ul className="pcge-list">
                <li>
                  <Check size={20} />
                  <span>10: Efectivo y Equivalentes</span>
                </li>
                <li>
                  <Check size={20} />
                  <span>12: Cuentas por Cobrar</span>
                </li>
                <li>
                  <Check size={20} />
                  <span>20: Mercaderías</span>
                </li>
                <li>
                  <Check size={20} />
                  <span>40: Tributos por Pagar</span>
                </li>
                <li>
                  <Check size={20} />
                  <span>70: Ventas</span>
                </li>
                <li>
                  <Check size={20} />
                  <span>60: Compras</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Precios</span>
            <h2 className="section-title">Simple y transparente</h2>
            <p className="section-subtitle">
              Empieza gratis, sin tarjetas de crédito. Solo paga cuando tu negocio crezca.
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-name">Prueba</div>
              <div className="pricing-desc">Para probar la plataforma</div>
              <div className="pricing-price">S/0</div>
              <div className="pricing-period">para siempre</div>
              <ul className="pricing-features">
                <li><Check size={18} /> Hasta 50 transacciones</li>
                <li><Check size={18} /> Plan de cuentas básico</li>
                <li><Check size={18} /> Reportes simples</li>
                <li><Check size={18} /> Soporte por email</li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-full">Empezar Gratis</Link>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Más Popular</div>
              <div className="pricing-name">Profesional</div>
              <div className="pricing-desc">Para negocios en crecimiento</div>
              <div className="pricing-price">S/50</div>
              <div className="pricing-period">por mes</div>
              <ul className="pricing-features">
                <li><Check size={18} /> Transacciones ilimitadas</li>
                <li><Check size={18} /> Plan de cuentas completo PCGE</li>
                <li><Check size={18} /> Balance y Estado de Resultados</li>
                <li><Check size={18} /> Reportes para SUNAT</li>
                <li><Check size={18} /> Inteligencia Artificial</li>
                <li><Check size={18} /> Soporte prioritario</li>
              </ul>
              <Link to="/register" className="btn btn-white btn-full">Empezar Prueba Gratis</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Testimonios</span>
            <h2 className="section-title">Emprendedores que confían en BeanPCGE</h2>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
              </div>
              <p className="testimonial-text">
                "Antes gastaba S/800 mensuales en contador. Ahora manejo mi contabilidad 
                yo mismo y me ahorro ese dinero. Es super fácil."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">MR</div>
                <div>
                  <div className="author-name">María Rodríguez</div>
                  <div className="author-role">Tienda de ropa - Lima</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
              </div>
              <p className="testimonial-text">
                "El reporte de gastos e ingresos me ayuda a saber exactamente 
                cómo está mi negocio. Antes no tenía ni idea."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">JC</div>
                <div>
                  <div className="author-name">Juan Carlos Mendoza</div>
                  <div className="author-role">Restaurante - Arequipa</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
              </div>
              <p className="testimonial-text">
                "Llevo mi contabilidad desde mi celular. Puedo registrar 
                una venta en segundos. ¡No puedo creer que antes usara Excel!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">LP</div>
                <div>
                  <div className="author-name">Luisa Pérez</div>
                  <div className="author-role">Boutique - Cusco</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>¿Listo para controlar tu negocio?</h2>
          <p>Únete a miles de emprendedores que ya están llevando su contabilidad correctamente.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-white btn-large">
              Empezar Gratis <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              Ver Demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo">
                <div className="logo-icon">₿</div>
                <span className="logo-text" style={{ color: 'white' }}>BeanPCGE</span>
              </Link>
              <p>Contabilidad profesional diseñada para emprendedores peruanos.</p>
            </div>
            <div>
              <div className="footer-title">Producto</div>
              <ul className="footer-links">
                <li><a href="#features">Características</a></li>
                <li><a href="#pricing">Precios</a></li>
                <li><Link to="/demo">Demo</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Empresa</div>
              <ul className="footer-links">
                <li><a href="#">Sobre Nosotros</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contacto</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Legal</div>
              <ul className="footer-links">
                <li><a href="#">Términos</a></li>
                <li><a href="#">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © 2024 BeanPCGE. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
