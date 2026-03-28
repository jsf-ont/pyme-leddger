import React, { useState } from 'react'
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
  ChevronRight,
  Building2,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  PiggyBank
} from 'lucide-react'

// Sample data - In production, this would come from Beancount API
const financialData = {
  pen: {
    totalAssets: 142500.00,
    totalLiabilities: 28500.00,
    totalEquity: 114000.00,
    monthlyIncome: 45000.00,
    monthlyExpenses: 32000.00,
    cash: 62500.00,
    accountsReceivable: 35000.00,
    inventory: 45000.00,
    accountsPayable: 18500.00,
    loans: 10000.00
  },
  usd: {
    totalAssets: 4850.00,
    totalLiabilities: 0.00,
    totalEquity: 4850.00,
    monthlyIncome: 1200.00,
    monthlyExpenses: 850.00,
    cash: 3200.00,
    accountsReceivable: 1650.00,
    inventory: 0.00,
    accountsPayable: 0.00,
    loans: 0.00
  }
}

const recentTransactions = [
  {
    id: 1,
    date: { day: 28, month: 'Mar' },
    description: 'Venta de mercadería',
    reference: 'FAC-001-0001',
    account: '10:1011',
    amount: 118.00,
    currency: 'PEN',
    type: 'credit'
  },
  {
    id: 2,
    date: { day: 28, month: 'Mar' },
    description: 'Costo de ventas',
    reference: 'COS-001',
    account: '69:6911',
    amount: 50.00,
    currency: 'PEN',
    type: 'debit'
  },
  {
    id: 3,
    date: { day: 27, month: 'Mar' },
    description: 'Pago alquiler oficina',
    reference: 'ALQ-003',
    account: '63:6311',
    amount: 2500.00,
    currency: 'PEN',
    type: 'debit'
  },
  {
    id: 4,
    date: { day: 26, month: 'Mar' },
    description: 'Cobro cliente - Distribuidora Norte',
    reference: 'COB-002',
    account: '12:1212',
    amount: 8500.00,
    currency: 'PEN',
    type: 'credit'
  },
  {
    id: 5,
    date: { day: 25, month: 'Mar' },
    description: 'Compra mercadería - Proveedor ABC',
    reference: 'COMP-004',
    account: '60:6011',
    amount: 15000.00,
    currency: 'PEN',
    type: 'debit'
  }
]

const topAccounts = [
  { code: '10:1011', name: 'Caja Principal', balance: 62500, type: 'asset' },
  { code: '20:2011', name: 'Mercaderías Almacén', balance: 45000, type: 'asset' },
  { code: '12:1212', name: 'Clientes Emitidas', balance: 35000, type: 'asset' },
  { code: '70:7011', name: 'Ventas Mercaderías', balance: 45000, type: 'income' },
  { code: '69:6911', name: 'Costo de Ventas', balance: 32000, type: 'expense' }
]

// Chart Components using Recharts patterns (vanilla implementation)
const RevenueChart = ({ data }) => (
  <svg viewBox="0 0 400 200" className="chart-svg">
    <defs>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0D5C4A" />
        <stop offset="100%" stopColor="#1A7A62" />
      </linearGradient>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0D5C4A" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0D5C4A" stopOpacity="0" />
      </linearGradient>
    </defs>
    
    {/* Grid lines */}
    {[0, 1, 2, 3, 4].map(i => (
      <line 
        key={i}
        x1="40" 
        y1={40 + i * 40} 
        x2="380" 
        y2={40 + i * 40} 
        stroke="#EDE8DE" 
        strokeWidth="1"
      />
    ))}
    
    {/* Bars */}
    {data.map((item, i) => (
      <g key={i}>
        <rect 
          x={60 + i * 50} 
          y={180 - (item.value / 50) * 140} 
          width="30" 
          height={(item.value / 50) * 140} 
          fill="url(#barGradient)" 
          rx="2"
          className="chart-bar"
          style={{ 
            transformOrigin: `${75 + i * 50}px 180px`,
            animation: `growBar 0.6s ease-out ${i * 0.1}s forwards`
          }}
        />
      </g>
    ))}
    
    {/* X-axis labels */}
    {data.map((item, i) => (
      <text 
        key={i}
        x={75 + i * 50} 
        y="195" 
        textAnchor="middle" 
        fontSize="10" 
        fill="#8C8C8C"
        fontFamily="Plus Jakarta Sans"
      >
        {item.label}
      </text>
    ))}
    
    <style>{`
      .chart-bar {
        transform: scaleY(0);
      }
      @keyframes growBar {
        to { transform: scaleY(1); }
      }
    `}</style>
  </svg>
)

const DonutChart = ({ segments }) => (
  <svg viewBox="0 0 200 200" className="donut-chart">
    <circle
      cx="100"
      cy="100"
      r="70"
      fill="none"
      stroke="#0D5C4A"
      strokeWidth="20"
      strokeDasharray={`${2 * Math.PI * 70 * 0.6} ${2 * Math.PI * 70}`}
      strokeDashoffset="0"
      transform="rotate(-90 100 100)"
      style={{ animation: 'drawDonut 1s ease-out forwards' }}
    />
    <circle
      cx="100"
      cy="100"
      r="70"
      fill="none"
      stroke="#D4A853"
      strokeWidth="20"
      strokeDasharray={`${2 * Math.PI * 70 * 0.25} ${2 * Math.PI * 70}`}
      strokeDashoffset={`${-2 * Math.PI * 70 * 0.6}`}
      transform="rotate(-90 100 100)"
      style={{ animation: 'drawDonut 1s ease-out 0.2s forwards', opacity: 0 }}
    />
    <circle
      cx="100"
      cy="100"
      r="70"
      fill="none"
      stroke="#1E3A5F"
      strokeWidth="20"
      strokeDasharray={`${2 * Math.PI * 70 * 0.15} ${2 * Math.PI * 70}`}
      strokeDashoffset={`${-2 * Math.PI * 70 * 0.85}`}
      transform="rotate(-90 100 100)"
      style={{ animation: 'drawDonut 1s ease-out 0.4s forwards', opacity: 0 }}
    />
    
    <style>{`
      @keyframes drawDonut {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>
  </svg>
)

// Format currency
const formatCurrency = (amount, currency) => {
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount))
  
  return currency === 'PEN' ? `S/ ${formatted}` : `$ ${formatted}`
}

// Sidebar Component
const Sidebar = () => (
  <aside className="sidebar animate-fade-in-up">
    <div className="sidebar-logo">
      <div className="sidebar-logo-icon">₿</div>
      <div className="sidebar-logo-text">
        <span className="sidebar-logo-title">PYME-Ledger</span>
        <span className="sidebar-logo-subtitle">Perú</span>
      </div>
    </div>
    
    <nav className="nav">
      <div className="nav-section">
        <div className="nav-section-title">Principal</div>
        <a className="nav-item active">
          <LayoutDashboard className="nav-item-icon" />
          Dashboard
        </a>
        <a className="nav-item">
          <FileText className="nav-item-icon" />
          Plan de Cuentas
        </a>
        <a className="nav-item">
          <Receipt className="nav-item-icon" />
          Transacciones
        </a>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Reportes</div>
        <a className="nav-item">
          <Landmark className="nav-item-icon" />
          Balance General
        </a>
        <a className="nav-item">
          <BarChart3 className="nav-item-icon" />
          Estado de Resultados
        </a>
        <a className="nav-item">
          <TrendingUp className="nav-item-icon" />
          Análisis Financiero
        </a>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Sistema</div>
        <a className="nav-item">
          <Settings className="nav-item-icon" />
          Configuración
        </a>
      </div>
    </nav>
    
    <div className="footer">
      <div className="footer-user">
        <div className="footer-avatar">MB</div>
        <div className="footer-user-info">
          <span className="footer-user-name">Mi Bodega SAC</span>
          <span className="footer-user-role">Administrador</span>
        </div>
      </div>
    </div>
  </aside>
)

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, iconVariant, currency, delay }) => (
  <div className={`card metric-card animate-fade-in-up animate-delay-${delay}`}>
    <div className="card-header">
      <span className="card-title">{title}</span>
      <div className={`card-icon ${iconVariant || ''}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="card-value">{formatCurrency(value, currency)}</div>
    {change && (
      <span className={`card-change ${change.type}`}>
        {change.type === 'positive' ? (
          <ArrowUpRight size={16} />
        ) : (
          <ArrowDownRight size={16} />
        )}
        {change.value}
      </span>
    )}
  </div>
)

// Account Item Component
const AccountItem = ({ code, name, balance }) => (
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
      <span className="transaction-day">{transaction.date.day}</span>
      <span className="transaction-month">{transaction.date.month}</span>
    </div>
    <div className="transaction-info">
      <h4>{transaction.description}</h4>
      <p>{transaction.reference}</p>
    </div>
    <div className="transaction-account">
      <span className="pcge-badge">{transaction.account}</span>
    </div>
    <div className={`transaction-amount ${transaction.type}`}>
      {transaction.type === 'credit' ? '+' : '-'}
      {formatCurrency(transaction.amount, transaction.currency)}
    </div>
  </div>
)

// Main Dashboard Component
const Dashboard = () => {
  const [currency, setCurrency] = useState('PEN')
  const data = financialData[currency]
  
  const chartData = [
    { label: 'Ene', value: 38 },
    { label: 'Feb', value: 42 },
    { label: 'Mar', value: 35 },
    { label: 'Abr', value: 48 },
    { label: 'May', value: 45 },
    { label: 'Jun', value: 50 }
  ]
  
  return (
    <div className="app">
      <div className="layout">
        <Sidebar />
        
        <main className="main">
          <header className="header animate-fade-in-up">
            <div className="header-left">
              <h1>Dashboard Financiero</h1>
              <p className="header-subtitle">Resumen de operaciones - Mi Bodega SAC</p>
            </div>
            <div className="header-right">
              <div className="currency-toggle">
                <button 
                  className={`currency-btn ${currency === 'PEN' ? 'active' : ''}`}
                  onClick={() => setCurrency('PEN')}
                >
                  PEN (S/)
                </button>
                <button 
                  className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                  onClick={() => setCurrency('USD')}
                >
                  USD ($)
                </button>
              </div>
              <span className="header-date">
                {new Date().toLocaleDateString('es-PE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </header>
          
          {/* Key Metrics */}
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
            <MetricCard 
              title="Total Activos" 
              value={data.totalAssets} 
              currency={currency}
              change={{ type: 'positive', value: '+12.5%' }}
              icon={Building2}
              delay={1}
            />
            <MetricCard 
              title="Pasivos Totales" 
              value={data.totalLiabilities}
              currency={currency}
              change={{ type: 'negative', value: '-3.2%' }}
              icon={CreditCard}
              iconVariant="secondary"
              delay={2}
            />
            <MetricCard 
              title="Patrimonio Neto" 
              value={data.totalEquity}
              currency={currency}
              change={{ type: 'positive', value: '+8.7%' }}
              icon={PiggyBank}
              iconVariant="accent"
              delay={3}
            />
            <MetricCard 
              title="Flujo de Caja" 
              value={data.cash}
              currency={currency}
              change={{ type: 'positive', value: '+15.3%' }}
              icon={Wallet}
              delay={4}
            />
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-2-1" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="card chart-card animate-fade-in-up animate-delay-3">
              <div className="card-header">
                <div>
                  <span className="card-title">Ingresos vs Gastos</span>
                  <h3 style={{ marginTop: 'var(--space-sm)' }}>Evolución Mensual</h3>
                </div>
              </div>
              <div className="chart-container">
                <RevenueChart data={chartData} />
              </div>
            </div>
            
            <div className="card chart-card animate-fade-in-up animate-delay-4">
              <div className="card-header">
                <div>
                  <span className="card-title">Composición</span>
                  <h3 style={{ marginTop: 'var(--space-sm)' }}>Activos</h3>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
                <DonutChart />
                <div className="account-list" style={{ flex: 1 }}>
                  <div className="account-item" style={{ cursor: 'default' }}>
                    <div className="account-info">
                      <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#0D5C4A' }} />
                      <span className="account-name">Liquidez (60%)</span>
                    </div>
                  </div>
                  <div className="account-item" style={{ cursor: 'default' }}>
                    <div className="account-info">
                      <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#D4A853' }} />
                      <span className="account-name">Cobranza (25%)</span>
                    </div>
                  </div>
                  <div className="account-item" style={{ cursor: 'default' }}>
                    <div className="account-info">
                      <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#1E3A5F' }} />
                      <span className="account-name">Inventario (15%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Row */}
          <div className="grid grid-2">
            {/* Top Accounts */}
            <div className="card animate-fade-in-up animate-delay-4">
              <div className="section-title">
                <h2>Cuentas Principales</h2>
                <a href="#">
                  Ver todas <ArrowRight size={14} />
                </a>
              </div>
              <div className="account-list">
                {topAccounts.map((account, i) => (
                  <AccountItem key={i} {...account} />
                ))}
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="card animate-fade-in-up animate-delay-5">
              <div className="section-title">
                <h2>Transacciones Recientes</h2>
                <a href="#">
                  Ver todas <ArrowRight size={14} />
                </a>
              </div>
              <div className="transaction-list">
                {recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
            <div className="section-title">
              <h2>Acciones Rápidas</h2>
            </div>
            <div className="quick-actions">
              <button className="action-btn">
                <Plus className="action-btn-icon" />
                <span>Nueva Transacción</span>
              </button>
              <button className="action-btn">
                <Upload className="action-btn-icon" />
                <span>Importar Datos</span>
              </button>
              <button className="action-btn">
                <Download className="action-btn-icon" />
                <span>Exportar Reporte</span>
              </button>
              <button className="action-btn">
                <FileText className="action-btn-icon" />
                <span>Generar Balance</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
