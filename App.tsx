
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { api } from './services/api';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import Appointments from './components/Appointments';
import AIChat from './components/AIChat';
import Header from './components/Header';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'appointments' | 'chat'>('dashboard');
  
  // Verificar se há token e carregar usuário
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('medflow_token');
      if (token) {
        try {
          const userData = await api.getProfile();
          setUser(userData);
        } catch (error) {
          // Token inválido, limpar
          api.clearToken();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    api.clearToken();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'patients' && <PatientList />}
          {activeTab === 'appointments' && <Appointments />}
          {activeTab === 'chat' && <AIChat />}
        </main>
      </div>
    </div>
  );
};

export default App;
