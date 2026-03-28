-- BeanPCGE Supabase Schema
-- Peruvian Accounting SaaS based on PCGE (Plan Contable General Empresarial)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPANIES
-- ============================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ruc TEXT UNIQUE,
  razon_social TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  currency_default TEXT DEFAULT 'PEN',
  igv_rate NUMERIC(5,2) DEFAULT 18.00,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACCOUNTING CORE - PCGE Accounts
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  subtype TEXT,
  currency TEXT DEFAULT 'PEN',
  balance NUMERIC(15,2) DEFAULT 0,
  parent_code TEXT,
  level INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_company_code 
ON accounts(company_id, code) WHERE company_id IS NOT NULL;

-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'PEN',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  reference TEXT,
  igv_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOURNAL ENTRIES (Partida Doble)
-- ============================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  reference TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  debit NUMERIC(15,2) DEFAULT 0,
  credit NUMERIC(15,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REPORTS CACHE
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('balance_sheet', 'income_statement', 'trial_balance', 'cash_flow', 'vat_return')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies: Users can only access their own companies
CREATE POLICY "Users can view own companies" ON companies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create companies" ON companies
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own companies" ON companies
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own companies" ON companies
  FOR DELETE USING (user_id = auth.uid());

-- Accounts: Users can only access their own accounts
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create accounts" ON accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (user_id = auth.uid());

-- Transactions: Users can only access their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (user_id = auth.uid());

-- Journal Entries: Users can only access their own entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create journal entries" ON journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (user_id = auth.uid());

-- Journal Lines: Users can only access lines from their entries
CREATE POLICY "Users can view own journal lines" ON journal_lines
  FOR SELECT USING (
    journal_entry_id IN (
      SELECT id FROM journal_entries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create journal lines" ON journal_lines
  FOR INSERT WITH CHECK (
    journal_entry_id IN (
      SELECT id FROM journal_entries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own journal lines" ON journal_lines
  FOR UPDATE USING (
    journal_entry_id IN (
      SELECT id FROM journal_entries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own journal lines" ON journal_lines
  FOR DELETE USING (
    journal_entry_id IN (
      SELECT id FROM journal_entries WHERE user_id = auth.uid()
    )
  );

-- Reports: Users can only access their own reports
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- PCGE DEFAULT ACCOUNTS SEED
-- ============================================

CREATE OR REPLACE FUNCTION seed_pcge_accounts_for_company()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default PCGE accounts for new companies
  INSERT INTO accounts (user_id, company_id, code, name, type, level, balance)
  SELECT 
    NEW.user_id,
    NEW.id,
    code,
    name,
    type,
    level,
    0
  FROM (VALUES
    -- 10 - EFECTIVO Y EQUIVALENTES DE EFECTIVO
    ('10', 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 'asset', 1),
    ('101', 'Caja', 'asset', 2),
    ('1011', 'Caja Principal', 'asset', 3),
    ('1012', 'Caja Chica', 'asset', 3),
    ('104', 'Cuentas Corrientes en Instituciones Financieras', 'asset', 2),
    ('1041', 'Cuentas Corrientes Operativas', 'asset', 3),
    ('1042', 'Cuentas de Ahorro', 'asset', 3),
    
    -- 12 - CUENTAS POR COBRAR COMERCIALES - TERCEROS
    ('12', 'CUENTAS POR COBRAR COMERCIALES - TERCEROS', 'asset', 1),
    ('121', 'Facturas, Boletas y Otros Comprobantes por Cobrar', 'asset', 2),
    ('1212', 'Emitidas', 'asset', 3),
    ('1213', 'Por Cobrar', 'asset', 3),
    
    -- 14 - CUENTAS POR COBRAR AL PERSONAL, A LOS ACCIONISTAS
    ('14', 'CUENTAS POR COBRAR AL PERSONAL, A LOS ACCIONISTAS', 'asset', 1),
    ('141', 'Préstamos al Personal', 'asset', 2),
    
    -- 20 - MERCADERÍAS
    ('20', 'MERCADERÍAS', 'asset', 1),
    ('201', 'Mercaderías', 'asset', 2),
    ('2011', 'Mercaderías Almacén', 'asset', 3),
    ('2012', 'Mercaderías en Tránsito', 'asset', 3),
    
    -- 40 - TRIBUTOS
    ('40', 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR', 'liability', 1),
    ('401', 'Gobierno Central', 'liability', 2),
    ('4011', 'IGV - Impuesto General a las Ventas', 'liability', 3),
    ('40111', 'IGV - Cuenta Propia', 'liability', 4),
    ('4012', 'Impuesto a la Renta', 'liability', 3),
    ('4013', 'Otros Tributos', 'liability', 3),
    
    -- 42 - CUENTAS POR PAGAR COMERCIALES
    ('42', 'CUENTAS POR PAGAR COMERCIALES - TERCEROS', 'liability', 1),
    ('421', 'Facturas, Boletas y Otros Comprobantes por Pagar', 'liability', 2),
    ('4211', 'Por Pagar', 'liability', 3),
    ('4212', 'Emitidas', 'liability', 3),
    
    -- 46 - CUENTAS POR PAGAR DIVERSAS
    ('46', 'CUENTAS POR PAGAR DIVERSAS - TERCEROS', 'liability', 1),
    ('461', 'Préstamos de Terceros', 'liability', 2),
    
    -- 50 - CAPITAL
    ('50', 'CAPITAL', 'equity', 1),
    ('501', 'Capital', 'equity', 2),
    ('5011', 'Capital Suscrito y Pagado', 'equity', 3),
    ('5012', 'Capital por Suscribir', 'equity', 3),
    
    -- 58 - RESERVAS
    ('58', 'RESERVAS', 'equity', 1),
    ('581', 'Reserva Legal', 'equity', 2),
    
    -- 59 - RESULTADOS ACUMULADOS
    ('59', 'RESULTADOS ACUMULADOS', 'equity', 1),
    ('591', 'Utilidades No Distribuidas', 'equity', 2),
    ('592', 'Pérdidas Acumuladas', 'equity', 2),
    
    -- 60 - COMPRAS
    ('60', 'COMPRAS', 'expense', 1),
    ('601', 'Mercaderías', 'expense', 2),
    ('6011', 'Mercaderías Almacén', 'expense', 3),
    ('6012', 'Mercaderías en Tránsito', 'expense', 3),
    ('609', 'Otros Gastos', 'expense', 2),
    
    -- 62 - GASTOS DE PERSONAL
    ('62', 'GASTOS DE PERSONAL, DIRECTORES Y GERENTES', 'expense', 1),
    ('621', 'Remuneraciones', 'expense', 2),
    ('6211', 'Sueldos y Salarios', 'expense', 3),
    ('6212', 'Comisiones', 'expense', 3),
    ('627', 'Seguridad y Previsión Social', 'expense', 2),
    ('6271', 'ESSALUD', 'expense', 3),
    ('6272', 'AFP', 'expense', 3),
    
    -- 63 - GASTOS DE SERVICIOS
    ('63', 'GASTOS DE SERVICIOS PRESTADOS POR TERCEROS', 'expense', 1),
    ('631', 'Alquileres', 'expense', 2),
    ('6311', 'Alquiler de Oficina', 'expense', 3),
    ('633', 'Servicios Básicos', 'expense', 2),
    ('6331', 'Luz', 'expense', 3),
    ('6332', 'Agua', 'expense', 3),
    ('6333', 'Teléfono e Internet', 'expense', 3),
    ('634', 'Mantenimiento y Reparaciones', 'expense', 2),
    
    -- 64 - GASTOS DE ACTIVOS
    ('64', 'GASTOS POR CARGAS FINANCIERAS', 'expense', 1),
    ('641', 'Intereses por Préstamos', 'expense', 2),
    ('643', 'Intereses por Financiamiento', 'expense', 2),
    
    -- 65 - OTROS GASTOS
    ('65', 'OTROS GASTOS DE GESTIÓN', 'expense', 1),
    ('651', 'Segros', 'expense', 2),
    ('656', 'Suministros', 'expense', 2),
    
    -- 68 - VALUACIÓN Y DETERIORO
    ('68', 'VALUACIÓN Y DETERIORO DE ACTIVOS Y PROVISIONES', 'expense', 1),
    ('681', 'Depreciación', 'expense', 2),
    ('6814', 'Depreciación de Inmuebles, Maquinaria y Equipo', 'expense', 3),
    
    -- 69 - COSTO DE VENTAS
    ('69', 'COSTO DE VENTAS', 'expense', 1),
    ('691', 'Mercaderías', 'expense', 2),
    ('6911', 'Mercaderías Almacén', 'expense', 3),
    
    -- 70 - VENTAS
    ('70', 'VENTAS', 'income', 1),
    ('701', 'Mercaderías', 'income', 2),
    ('7011', 'Mercaderías Almacén', 'income', 3),
    ('7012', 'Mercaderías en Consignación', 'income', 3),
    
    -- 73 - PRODUCCCIÓN ALMACENADA
    ('73', 'PRODUCCIÓN ALMACENADA (INCREMENTO DE)', 'income', 1),
    
    -- 74 - OTROS INGRESOS
    ('74', 'OTROS INGRESOS DE GESTIÓN', 'income', 1),
    ('741', 'Intereses Ganados', 'income', 2),
    ('745', 'Ingresos por Comisiones', 'income', 2),
    ('749', 'Otros Ingresos', 'income', 2)
  ) AS t(code, name, type, level)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to seed PCGE accounts when a new company is created
CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION seed_pcge_accounts_for_company();

-- ============================================
-- AUTOMATIC PROFILE CREATION
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get account balance
CREATE OR REPLACE FUNCTION get_account_balance(p_account_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT balance INTO v_balance
  FROM accounts
  WHERE id = p_account_id;
  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate IGV (18% Peruvian VAT)
CREATE OR REPLACE FUNCTION calculate_igv(p_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(p_amount * 0.18, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total with IGV
CREATE OR REPLACE FUNCTION calculate_total_with_igv(p_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(p_amount * 1.18, 2);
END;
$$ LANGUAGE plpgsql;
