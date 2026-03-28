const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  app: {
    name: import.meta.env.VITE_APP_NAME || 'BeanPCGE',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: 'Contabilidad para MYPEs Peruanas',
  },

  features: {
    supabaseAuth: import.meta.env.VITE_FEATURE_SUPABASE_AUTH === 'true',
    demoMode: import.meta.env.VITE_FEATURE_DEMO_MODE !== 'false',
    reports: import.meta.env.VITE_FEATURE_REPORTS !== 'false',
    sunatExport: import.meta.env.VITE_FEATURE_SUNAT_EXPORT === 'true',
  },

  pagination: {
    defaultLimit: 50,
    maxLimit: 100,
  },

  dateFormat: {
    short: 'DD/MM/YYYY',
    long: 'MMMM D, YYYY',
  },

  currency: {
    default: 'PEN',
    symbol: 'S/',
    locales: 'es-PE',
  },

  pcge: {
    version: '2019',
    country: 'Peru',
  },
};

export default config;
