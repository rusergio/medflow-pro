
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { api } from './services/api';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import AdminSidebar, { AdminTab } from './components/AdminSidebar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import Appointments from './components/Appointments';
import AIChat from './components/AIChat';
import Header from './components/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminReports from './components/admin/AdminReports';
import AdminSettings from './components/admin/AdminSettings';
import AdminLogs from './components/admin/AdminLogs';
import MyProfile from './components/MyProfile';
import UserSettings from './components/UserSettings';

const isAdmin = (user: User) => user.role === UserRole.ADMIN || user.role === 'Administrador';

type MainTab = 'dashboard' | 'patients' | 'appointments' | 'chat' | 'profile' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminTab>('admin-dashboard');
  
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

  if (isAdmin(user)) {
    return (
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        <AdminSidebar activeTab={adminTab} setActiveTab={setAdminTab} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            user={user}
            onLogout={handleLogout}
            onProfileClick={() => setAdminTab('profile')}
            onSettingsClick={() => setAdminTab('settings')}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
            {adminTab === 'admin-dashboard' && <AdminDashboard />}
            {adminTab === 'users' && <AdminUsers />}
            {adminTab === 'reports' && <AdminReports />}
            {adminTab === 'settings' && <AdminSettings />}
            {adminTab === 'logs' && <AdminLogs />}
            {adminTab === 'profile' && <MyProfile user={user} onUserUpdate={setUser} />}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={user}
          onLogout={handleLogout}
          onProfileClick={() => setActiveTab('profile')}
          onSettingsClick={() => setActiveTab('settings')}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'patients' && <PatientList />}
          {activeTab === 'appointments' && <Appointments />}
          {activeTab === 'chat' && <AIChat />}
          {activeTab === 'profile' && <MyProfile user={user} onUserUpdate={setUser} />}
          {activeTab === 'settings' && <UserSettings />}
        </main>
      </div>
    </div>
  );
};

export default App;
