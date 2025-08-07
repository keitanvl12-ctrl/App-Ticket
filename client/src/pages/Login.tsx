import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import CompanyBranding from '../components/auth/CompanyBranding';
import SecurityIndicators from '../components/auth/SecurityIndicators';
import TenantSelector from '../components/auth/TenantSelector';

export default function Login() {
  const [activeTab, setActiveTab] = React.useState<'login' | 'forgot'>('login');
  const [selectedTenant, setSelectedTenant] = React.useState('principal');

  const tenants = [
    { id: 'principal', name: 'Matriz Principal', location: 'São Paulo, SP' },
    { id: 'filial1', name: 'Filial Rio de Janeiro', location: 'Rio de Janeiro, RJ' },
    { id: 'filial2', name: 'Filial Belo Horizonte', location: 'Belo Horizonte, MG' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Company Branding */}
        <CompanyBranding />

        {/* Tenant Selector */}
        <TenantSelector
          tenants={tenants}
          selectedTenant={selectedTenant}
          onTenantChange={setSelectedTenant}
        />

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Fazer Login
            </button>
            <button
              onClick={() => setActiveTab('forgot')}
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'forgot'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Esqueci a Senha
            </button>
          </div>

          {/* Forms */}
          {activeTab === 'login' ? (
            <LoginForm onSwitchToForgot={() => setActiveTab('forgot')} />
          ) : (
            <ForgotPasswordForm onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </div>

        {/* Security Indicators */}
        <SecurityIndicators />
      </div>
    </div>
  );
}