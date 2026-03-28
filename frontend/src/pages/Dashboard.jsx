import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  BarChart3, 
  Settings, 
  Wallet, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Upload,
  Download,
  Building2,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank,
  LogOut,
  Loader2,
  X,
  Check,
  AlertCircle,
  Menu,
  ChevronDown
} from 'lucide-react'

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Format currency
const formatCurrency = (amount, currency = 'PEN') => {
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount))
  return currency === 'PEN' ? `S/ ${formatted}` : `$ ${formatted}`
}

// Sample data for demo mode
const sampleData = {
  pen: {
    totalAssets: 142500.00,
    totalLiabilities: 28500.00,
    totalEquity: 114000.00,
    monthlyIncome: 45000.00,
    monthlyExpenses: 32000.00,
    netProfit: 13000.00,
    cash: 62500.00,
    accountsReceivable: 35000.00,
    inventory: 45000.00,
    accountsPayable: 18500.00,
    sunatReserve: 2340.00
  },
  usd: {
    totalAssets: 4850.00,
    totalLiabilities: 0,
    totalEquity: 4850.00,
    monthlyIncome: 1530.00,
    monthlyExpenses: 1080.00,
    netProfit: 450.00,
    cash: 2100.00,
    accountsReceivable: 1200.00,
    inventory: 1550.00,
    accountsPayable: 0,
    sunatReserve: 0
  }
}

const sampleTransactions = [
  { id: 1, day: 28, month: 'Mar', description: 'Venta de mercadería', reference: 'FAC-001-0001', account: '70:7011', amount: 1180.00, currency: 'PEN', type: 'income' },
  { id: 2, day: 28, month: 'Mar', description: 'Costo de ventas', reference: 'COS-001', account: '69:6911', amount: 500.00, currency: 'PEN', type: 'expense' },
  { id: 3, day: 27, month: 'Mar', description: 'Pago alquiler oficina', reference: 'ALQ-003', account: '63:6311', amount: 2500.00, currency: 'PEN', type: 'expense' },
  { id: 4, day: 26, month: 'Mar', description: 'Cobro cliente - Distribuidora Norte', reference: 'COB-002', account: '12:1212', amount: 8500.00, currency: 'PEN', type: 'income' },
  { id: 5, day: 25, month: 'Mar', description: 'Compra mercadería - Proveedor ABC', reference: 'COMP-004', account: '60:6011', amount: 15000.00, currency: 'PEN', type: 'expense' },
  { id: 6, day: 24, month: 'Mar', description: 'Pago servicios básicos', reference: 'SERV-001', account: '63:6361', amount: 850.00, currency: 'PEN', type: 'expense' },
  { id: 7, day: 23, month: 'Mar', description: 'Venta al crédito', reference: 'FAC-001-0002', account: '70:7011', amount: 3500.00, currency: 'PEN', type: 'income' }
]

const topAccounts = [
  { code: '10:1011', name: 'Caja Principal', balance: 62500, type: 'Activo' },
  { code: '20:2011', name: 'Mercaderías Almacén', balance: 45000, type: 'Activo' },
  { code: '12:1212', name: 'Clientes Emitidas', balance: 35000, type: 'Activo' },
  { code: '70:7011', name: 'Ventas Mercaderías', balance: 45000, type: 'Ingreso' },
  { code: '69:6911', name: 'Costo de Ventas', balance: 32000, type: 'Gasto' }
]

// Chart Components
const RevenueChart = ({ data }) => (
  <svg viewBox="0 0 400 200" className="chart-svg">
    <defs>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0D5C4A" />
        <stop offset="100%" stopColor="#1A7A62" />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4].map(i => (
      <line key={i} x1="40" y1={40 + i * 40} x2="380" y2={40 + i * 40} stroke="#EDE8DE" strokeWidth="1" />
    ))}
    {data.map((item, i) => (
      <g key={i}>
        <rect 
          x={60 + i * 50} 
          y={180 - (item.value / 55) * 140} 
          width="30" 
          height={(item.value / 55) * 140} 
          fill="url(#barGradient)" 
          rx="2"
          className="chart-bar"
          style={{ transformOrigin: `${75 + i * 50}px 180px`, animation: `growBar 0.6s ease-out ${i * 0.1}s forwards` }}
        />
      </g>
    ))}
    {data.map((item, i) => (
      <text key={i} x={75 + i * 50} y="195" textAnchor="middle" fontSize="10" fill="#8C8C8C" fontFamily="Plus Jakarta Sans, sans-serif">
        {item.label}
      </text>
    ))}
    <style>{`
      .chart-bar { transform: scaleY(0); }
      @keyframes growBar { to { transform: scaleY(1); } }
    `}</style>
  </svg>
)

const DonutChart = ({ segments }) => (
  <svg viewBox="0 0 200 200" className="donut-chart">
    <circle cx="100" cy="100" r="70" fill="none" stroke="#0D5C4A" strokeWidth="20" 
      strokeDasharray={`${2 * Math.PI * 70 * 0.6} ${2 * Math.PI * 70}`} strokeDashoffset="0" 
      transform="rotate(-90 100 100)" style={{ animation: 'drawDonut 1s ease-out forwards' }} />
    <circle cx="100" cy="100" r="70" fill="none" stroke="#D4A853" strokeWidth="20" 
      strokeDasharray={`${2 * Math.PI * 70 * 0.25} ${2 * Math.PI * 70}`} strokeDashoffset={`${-2 * Math.PI * 70 * 0.6}`} 
      transform="rotate(-90 100 100)" style={{ animation: 'drawDonut 1s ease-out 0.2s forwards', opacity: 0 }} />
    <circle cx="100" cy="100" r="70" fill="none" stroke="#1E3A5F" strokeWidth="20" 
      strokeDasharray={`${2 * Math.PI * 70 * 0.15} ${2 * Math.PI * 70}`} strokeDashoffset={`${-2 * Math.PI * 70 * 0.85}`} 
      transform="rotate(-90 100 100)" style={{ animation: 'drawDonut 1s ease-out 0.4s forwards', opacity: 0 }} />
    <style>{`@keyframes drawDonut { from { opacity: 0; } to { opacity: 1; } }`}</style>
  </svg>
)

// Sidebar Component
const Sidebar = ({ activePage, setActivePage, onLogout, companyName, onToggleMobile }) => (
  <aside className="sidebar">
    <div className="sidebar-logo">
      <div className="sidebar-logo-icon">₿</div>
      <div className="sidebar-logo-text">
        <span className="sidebar-logo-title">BeanPCGE</span>
        <span className="sidebar-logo-subtitle">Perú</span>
      </div>
      <button className="mobile-close" onClick={onToggleMobile}><X size={24} /></button>
    </div>
    
    <nav className="sidebar-nav">
      <div className="nav-section">
        <div className="nav-section-title">Principal</div>
        <button className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
          <LayoutDashboard size={20} />
          Dashboard
        </button>
        <button className={`nav-item ${activePage === 'accounts' ? 'active' : ''}`} onClick={() => setActivePage('accounts')}>
          <FileText size={20} />
          Plan de Cuentas
        </button>
        <button className={`nav-item ${activePage === 'transactions' ? 'active' : ''}`} onClick={() => setActivePage('transactions')}>
          <Receipt size={20} />
          Transacciones
        </button>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Reportes</div>
        <button className={`nav-item ${activePage === 'balance' ? 'active' : ''}`} onClick={() => setActivePage('balance')}>
          <Landmark size={20} />
          Balance General
        </button>
        <button className={`nav-item ${activePage === 'income' ? 'active' : ''}`} onClick={() => setActivePage('income')}>
          <BarChart3 size={20} />
          Estado de Resultados
        </button>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Sistema</div>
        <button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
          <Settings size={20} />
          Configuración
        </button>
      </div>
    </nav>
    
    <div className="sidebar-footer">
      <div className="footer-user">
        <div className="footer-avatar">{(companyName || 'ME').slice(0, 2).toUpperCase()}</div>
        <div className="footer-user-info">
          <span className="footer-user-name">{companyName}</span>
          <span className="footer-user-role">Plan Pro</span>
        </div>
      </div>
      <button onClick={onLogout} className="nav-item logout-btn">
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  </aside>
)

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// Transaction Form
const TransactionForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    description: '',
    amount: '',
    account: '70:7011',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Tipo de Transacción</label>
        <div className="type-toggle">
          <button type="button" className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`} onClick={() => setFormData({...formData, type: 'income'})}>
            <TrendingUp size={16} /> Ingreso
          </button>
          <button type="button" className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`} onClick={() => setFormData({...formData, type: 'expense'})}>
            <TrendingDown size={16} /> Gasto
          </button>
        </div>
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <input type="text" required placeholder="Ej: Venta de mercadería" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Monto (S/)</label>
        <input type="number" required step="0.01" min="0" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Cuenta PCGE</label>
        <select value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})}>
          <option value="70:7011">70 - Ventas</option>
          <option value="69:6911">69 - Costo de Ventas</option>
          <option value="60:6011">60 - Compras</option>
          <option value="63:6311">63 - Servicios</option>
          <option value="10:1011">10 - Caja/Banco</option>
          <option value="12:1212">12 - Clientes</option>
        </select>
      </div>
      <div className="form-group">
        <label>Fecha</label>
        <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Referencia (opcional)</label>
        <input type="text" placeholder="Ej: FAC-001" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
      </div>
      <button type="submit" className="btn btn-primary btn-full">Registrar Transacción</button>
    </form>
  )
}

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, iconVariant, currency, delay }) => (
  <div className={`card metric-card animate-delay-${delay}`}>
    <div className="card-header">
      <span className="card-title">{title}</span>
      <div className={`card-icon ${iconVariant || ''}`}><Icon size={20} /></div>
    </div>
    <div className="card-value">{formatCurrency(value, currency)}</div>
    {change && (
      <span className={`card-change ${change.type}`}>
        {change.type === 'positive' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {change.value} vs mes anterior
      </span>
    )}
  </div>
)

// Account Item Component
const AccountItem = ({ code, name, balance, type }) => (
  <div className="account-item">
    <div className="account-info">
      <span className="account-code">{code}</span>
      <span className="account-name">{name}</span>
    </div>
    <span className="account-balance">{formatCurrency(balance, 'PEN')}</span>
  </div>
)

// Transaction Item Component
const TransactionItem = ({ transaction }) => (
  <div className="transaction-item">
    <div className="transaction-date">
      <span className="transaction-day">{transaction.day}</span>
      <span className="transaction-month">{transaction.month}</span>
    </div>
    <div className="transaction-info">
      <h4>{transaction.description}</h4>
      <p>{transaction.reference}</p>
    </div>
    <div className="transaction-account">
      <span className="pcge-badge">{transaction.account}</span>
    </div>
    <div className={`transaction-amount ${transaction.type}`}>
      {transaction.type === 'income' ? '+' : '-'}
      {formatCurrency(transaction.amount, transaction.currency)}
    </div>
  </div>
)

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate()
  const [currency, setCurrency] = useState('PEN')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [data, setData] = useState(sampleData.pen)
  const [transactions, setTransactions] = useState(sampleTransactions)
  const [activePage, setActivePage] = useState('dashboard')
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedCompany = localStorage.getItem('company')
    
    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedCompany) setCompany(JSON.parse(storedCompany))
    
    // If Supabase is configured, try to fetch real data
    if (SUPABASE_URL && token) {
      fetchData(token)
    } else {
      setLoading(false)
    }
  }, [])
  
  const fetchData = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (result.summary) {
        setData({
          totalAssets: result.summary.accountsReceivable + 62500,
          totalLiabilities: result.summary.accountsPayable,
          totalEquity: result.summary.accountsReceivable + 62500 - result.summary.accountsPayable,
          monthlyIncome: result.summary.income,
          monthlyExpenses: result.summary.expenses,
          netProfit: result.summary.income - result.summary.expenses,
          cash: 62500,
          accountsReceivable: result.summary.accountsReceivable,
          inventory: 45000,
          accountsPayable: result.summary.accountsPayable,
          sunatReserve: (result.summary.income - result.summary.expenses) * 0.3
        })
      }
    } catch (err) {
      console.log('Using demo data (API not connected)')
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
    navigate('/')
  }
  
  const handleNewTransaction = (formData) => {
    const newTransaction = {
      id: transactions.length + 1,
      day: new Date(formData.date).getDate(),
      month: new Date(formData.date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
      description: formData.description,
      reference: formData.reference || `${formData.type === 'income' ? 'FAC' : 'EXP'}-${String(transactions.length + 1).padStart(4, '0')}`,
      account: formData.account,
      amount: parseFloat(formData.amount),
      currency: 'PEN',
      type: formData.type === 'income' ? 'income' : 'expense'
    }
    
    const updatedData = { ...data }
    if (formData.type === 'income') {
      updatedData.monthlyIncome += parseFloat(formData.amount)
    } else {
      updatedData.monthlyExpenses += parseFloat(formData.amount)
    }
    updatedData.netProfit = updatedData.monthlyIncome - updatedData.monthlyExpenses
    updatedData.sunatReserve = updatedData.netProfit * 0.3
    
    setTransactions([newTransaction, ...transactions])
    setData(updatedData)
  }
  
  const chartData = [
    { label: 'Ene', value: 38 },
    { label: 'Feb', value: 42 },
    { label: 'Mar', value: 35 },
    { label: 'Abr', value: 48 },
    { label: 'May', value: 45 },
    { label: 'Jun', value: 50 }
  ]
  
  const companyName = company?.name || user?.name || 'Mi Empresa'
  
  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 size={48} className="animate-spin" style={{ color: '#0D5C4A' }} />
        <p>Cargando dashboard...</p>
      </div>
    )
  }
  
  return (
    <div className="app">
      {mobileMenuOpen && <div className="modal-overlay" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={handleLogout} 
        companyName={companyName}
        onToggleMobile={() => setMobileMenuOpen(false)}
      />
      
      <main className="main">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="mobile-title">{companyName}</span>
        </div>

        <header className="header">
          <div className="header-left">
            <h1>Dashboard Financiero</h1>
            <p className="header-subtitle">Resumen de operaciones - {companyName}</p>
          </div>
          <div className="header-right">
            <div className="currency-toggle">
              <button className={`currency-btn ${currency === 'PEN' ? 'active' : ''}`} onClick={() => setCurrency('PEN')}>PEN (S/)</button>
              <button className={`currency-btn ${currency === 'USD' ? 'active' : ''}`} onClick={() => setCurrency('USD')}>USD ($)</button>
            </div>
            <span className="header-date">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>
        
        {/* Key Metrics */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
          <MetricCard title="Total Activos" value={data.totalAssets} currency={currency} change={{ type: 'positive', value: '+12.5%' }} icon={Building2} delay={1} />
          <MetricCard title="Pasivos Totales" value={data.totalLiabilities} currency={currency} change={{ type: 'negative', value: '-3.2%' }} icon={CreditCard} iconVariant="secondary" delay={2} />
          <MetricCard title="Patrimonio Neto" value={data.totalEquity} currency={currency} change={{ type: 'positive', value: '+8.7%' }} icon={PiggyBank} iconVariant="accent" delay={3} />
          <MetricCard title="Flujo de Caja" value={data.cash} currency={currency} change={{ type: 'positive', value: '+15.3%' }} icon={Wallet} delay={4} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2-1" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="card chart-card animate-delay-3">
            <div className="card-header">
              <div>
                <span className="card-title">Ingresos vs Gastos</span>
                <h3 style={{ marginTop: 'var(--space-sm)' }}>Evolución Mensual</h3>
              </div>
            </div>
            <div className="chart-container"><RevenueChart data={chartData} /></div>
          </div>
          
          <div className="card chart-card animate-delay-4">
            <div className="card-header">
              <div>
                <span className="card-title">Composición</span>
                <h3 style={{ marginTop: 'var(--space-sm)' }}>Activos</h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
              <DonutChart />
              <div className="account-list" style={{ flex: 1 }}>
                <div className="account-item"><div className="account-info"><div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#0D5C4A' }} /><span className="account-name">Liquidez (60%)</span></div></div>
                <div className="account-item"><div className="account-info"><div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#D4A853' }} /><span className="account-name">Cobranza (25%)</span></div></div>
                <div className="account-item"><div className="account-info"><div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#1E3A5F' }} /><span className="account-name">Inventario (15%)</span></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-2">
          <div className="card animate-delay-4">
            <div className="section-title">
              <h2>Cuentas Principales</h2>
              <button className="link-btn" onClick={() => setActivePage('accounts')}>Ver todas <ArrowRight size={14} /></button>
            </div>
            <div className="account-list">
              {topAccounts.map((account, i) => <AccountItem key={i} {...account} />)}
            </div>
          </div>
          
          <div className="card animate-delay-5">
            <div className="section-title">
              <h2>Transacciones Recientes</h2>
              <button className="link-btn" onClick={() => setActivePage('transactions')}>Ver todas <ArrowRight size={14} /></button>
            </div>
            <div className="transaction-list">
              {transactions.slice(0, 5).map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
          <div className="section-title">
            <h2>Acciones Rápidas</h2>
          </div>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => setShowNewTransaction(true)}>
              <Plus className="action-btn-icon" />
              <span>Nueva Transacción</span>
            </button>
            <button className="action-btn" onClick={() => setActivePage('balance')}>
              <FileText className="action-btn-icon" />
              <span>Generar Balance</span>
            </button>
            <button className="action-btn">
              <Download className="action-btn-icon" />
              <span>Exportar Reporte</span>
            </button>
            <button className="action-btn" onClick={() => window.print()}>
              <Upload className="action-btn-icon" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-3" style={{ marginTop: 'var(--space-xl)' }}>
          <div className="card summary-card income">
            <div className="summary-icon"><TrendingUp size={24} /></div>
            <div className="summary-content">
              <span className="summary-label">Ingresos del Mes</span>
              <span className="summary-value">{formatCurrency(data.monthlyIncome, currency)}</span>
            </div>
          </div>
          <div className="card summary-card expense">
            <div className="summary-icon"><TrendingDown size={24} /></div>
            <div className="summary-content">
              <span className="summary-label">Gastos del Mes</span>
              <span className="summary-value">{formatCurrency(data.monthlyExpenses, currency)}</span>
            </div>
          </div>
          <div className="card summary-card sunat">
            <div className="summary-icon"><AlertCircle size={24} /></div>
            <div className="summary-content">
              <span className="summary-label">Reserva SUNAT (30%)</span>
              <span className="summary-value">{formatCurrency(data.sunatReserve, currency)}</span>
            </div>
          </div>
        </div>
      </main>

      {/* New Transaction Modal */}
      <Modal isOpen={showNewTransaction} onClose={() => setShowNewTransaction(false)} title="Nueva Transacción">
        <TransactionForm onSubmit={handleNewTransaction} onClose={() => setShowNewTransaction(false)} />
      </Modal>
    </div>
  )
}

export default Dashboard
