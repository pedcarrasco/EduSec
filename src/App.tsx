import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { CourseCatalog } from './components/CourseCatalog';
import { EnrollmentList } from './components/EnrollmentList';
import { UserManagement } from './components/UserManagement';
import { ApiExplorer } from './components/ApiExplorer';
import { DatabaseMonitor } from './components/DatabaseMonitor';
import { SocConsole } from './components/SocConsole';
import { AuthModal } from './components/AuthModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Lock, LogIn, UserPlus, ShieldAlert, GraduationCap } from 'lucide-react';
import { Course, Enrollment, User, SecurityEvent, SOCStats, SOCWebhookConfig, UserRole, UserStatus } from './types';

export default function App() {
  // Navigation & User - Starts logged out so the user is asked to log in or create an account
  const [activeTab, setActiveTab] = useState<NavTabType>('courses');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('edusec_session_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // App Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SOCStats | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<SOCWebhookConfig>({
    url: '',
    enabled: false,
    format: 'json',
    minSeverity: 'LOW'
  });

  // Modals - Automatically open auth modal on entrance if not logged in
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('edusec_session_user');
    } catch {
      return true;
    }
  });
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Loading indicators
  const [isLoading, setIsLoading] = useState(false);

  // ----------------------------------------------------
  // Data Fetching
  // ----------------------------------------------------
  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    try {
      const res = await fetch('/api/enrollments');
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsRes, statsRes, webhookRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/soc/stats'),
        fetch('/api/soc/webhook')
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || null);
      }
      if (webhookRes.ok) {
        const data = await webhookRes.json();
        if (data.config) setWebhookConfig(data.config);
      }
    } catch (err) {
      console.error('Error fetching security events:', err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchCourses(), fetchEnrollments(), fetchUsers(), fetchEvents()]);
    setIsLoading(false);
  }, [fetchCourses, fetchEnrollments, fetchUsers, fetchEvents]);

  useEffect(() => {
    refreshAllData();
    // Auto-refresh security telemetry every 8 seconds for live SOC view
    const interval = setInterval(fetchEvents, 8000);
    return () => clearInterval(interval);
  }, [refreshAllData, fetchEvents]);

  // ----------------------------------------------------
  // Course & Enrollment Operations
  // ----------------------------------------------------
  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser?.id,
          studentEmail: currentUser?.email || 'alumno@edusec.local',
          studentName: currentUser?.name || 'Estudiante Activo'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al inscribirse al curso');
        return;
      }

      setEnrollments(prev => [data.enrollment, ...prev]);
      await Promise.all([fetchCourses(), fetchEvents()]);
      setActiveTab('enrollments');
    } catch (err) {
      console.error('Enroll error:', err);
    }
  };

  const handleUpdateProgress = async (enrollmentId: string, completedLessonIds: string[]) => {
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedLessonIds })
      });

      if (!res.ok) throw new Error('Error al actualizar progreso');
      const data = await res.json();

      setEnrollments(prev =>
        prev.map(e => (e.id === enrollmentId ? data.enrollment : e))
      );
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/cancel`, {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Error al cancelar inscripción');
      const data = await res.json();

      setEnrollments(prev =>
        prev.map(e => (e.id === enrollmentId ? data.enrollment : e))
      );
      await Promise.all([fetchCourses(), fetchEvents()]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseCreated = (course: Course) => {
    setCourses(prev => [course, ...prev]);
    fetchEvents();
  };

  const handleCourseUpdated = (updated: Course) => {
    setCourses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    fetchEvents();
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: currentUser?.email || 'admin@edusec.local' })
      });

      if (res.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // User Operations (Professors and Students)
  // ----------------------------------------------------
  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: newRole,
          adminEmail: currentUser?.email || 'admin@edusec.local'
        })
      });

      if (!res.ok) throw new Error('Fallo al actualizar rol');
      const data = await res.json();

      setUsers(prev => prev.map(u => (u.id === userId ? data.user : u)));
      if (currentUser?.id === userId) {
        setCurrentUser(data.user);
      }
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    fetchEvents();
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: currentUser?.email || 'admin@edusec.local' })
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchEvents();
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminEmail: currentUser?.email || 'admin@edusec.local'
        })
      });

      if (!res.ok) throw new Error('Fallo al actualizar estado de usuario');
      const data = await res.json();

      setUsers(prev => prev.map(u => (u.id === userId ? data.user : u)));
      if (currentUser?.id === userId) {
        setCurrentUser(data.user);
      }
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // SOC & SIEM Operations
  // ----------------------------------------------------
  const handleUpdateWebhook = async (config: Partial<SOCWebhookConfig>) => {
    try {
      const res = await fetch('/api/soc/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const data = await res.json();
        setWebhookConfig(data.config);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestWebhook = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/soc/test-webhook', { method: 'POST' });
      const data = await res.json();
      fetchEvents();
      return {
        success: res.ok && data.success,
        message: data.message || data.error || 'Respuesta del webhook obtenida'
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error de conexión' };
    }
  };

  const handleSimulateScenario = async (scenario: string) => {
    try {
      await fetch('/api/soc/simulate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      await fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearEvents = async () => {
    try {
      await fetch('/api/events/clear', { method: 'POST' });
      await fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Identity Switcher (For easy Capstone testing)
  // ----------------------------------------------------
  const handleQuickSwitchUser = (identifier: string) => {
    const query = identifier.toLowerCase();
    const found = users.find(u => 
      u.email.toLowerCase() === query || 
      u.name.toLowerCase() === query ||
      (u.role === 'admin' && (query === 'edusec' || query === 'admin@edusec.local'))
    );

    if (found) {
      setCurrentUser(found);
      try {
        sessionStorage.setItem('edusec_session_user', JSON.stringify(found));
      } catch {
        // ignore
      }
    } else {
      const isAdmin = query.includes('admin') || query.includes('edusec');
      const role: UserRole = isAdmin
        ? 'admin'
        : identifier.includes('prof')
        ? 'professor'
        : identifier.includes('auditor')
        ? 'soc_auditor'
        : 'student';

      const newUser: User = {
        id: isAdmin ? 'usr-admin' : `usr-${identifier.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: isAdmin ? 'Administrador EduSec' : identifier.split('@')[0],
        email: isAdmin ? 'EduSec' : identifier,
        role,
        department: role === 'admin' ? 'Dirección de Tecnología y Ciberseguridad' : role === 'professor' ? 'Docencia Ciberseguridad' : 'Campus General',
        status: 'active',
        createdAt: new Date().toISOString(),
        failedLoginCount: 0
      };
      setCurrentUser(newUser);
      try {
        sessionStorage.setItem('edusec_session_user', JSON.stringify(newUser));
      } catch {
        // ignore
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('edusec_session_user');
    } catch {
      // ignore
    }
    setAuthInitialTab('login');
    setIsAuthOpen(true);
  };

  const criticalAlertCount = stats?.criticalAlerts || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || 'login');
          setIsAuthOpen(true);
        }}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest Banner if not logged in */}
        {!currentUser && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Acceso Institucional EduSec Requerido</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Modo Invitado
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Por favor inicia sesión o crea una cuenta institucional para matricularte, gestionar cursos y acceder a la telemetría SOC.
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Cuenta de Administración: <span className="text-indigo-400 font-bold">EduSec</span> | Password: <span className="text-indigo-400 font-bold">MartiJaviCabo</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              <button
                onClick={() => {
                  setAuthInitialTab('login');
                  setIsAuthOpen(true);
                }}
                className="flex-1 md:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                onClick={() => {
                  setAuthInitialTab('register');
                  setIsAuthOpen(true);
                }}
                className="flex-1 md:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <CourseCatalog
            courses={courses}
            currentUser={currentUser}
            enrollments={enrollments}
            onEnroll={handleEnroll}
            onCourseUpdated={handleCourseUpdated}
            onCourseCreated={handleCourseCreated}
            onDeleteCourse={handleDeleteCourse}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'enrollments' && (
          <EnrollmentList
            enrollments={enrollments}
            courses={courses}
            currentUser={currentUser}
            onUpdateProgress={handleUpdateProgress}
            onCancelEnrollment={handleCancelEnrollment}
            onNavigateToCatalog={() => setActiveTab('courses')}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'users' && (
          currentUser && currentUser.role === 'admin' ? (
            <UserManagement
              users={users}
              onUpdateRole={handleUpdateUserRole}
              onUpdateStatus={handleUpdateUserStatus}
              onUserCreated={handleUserCreated}
              onDeleteUser={handleDeleteUser}
              currentUser={currentUser}
              isLoading={isLoading}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto my-12">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Panel de Administración de Usuarios</h3>
              <p className="text-xs text-slate-400 mb-6">
                Esta sección requiere credenciales de Administrador TI. Por favor inicia sesión con la cuenta de administración (Usuario: <span className="font-mono text-purple-300 font-bold">EduSec</span> / Contraseña: <span className="font-mono text-purple-300 font-bold">MartiJaviCabo</span>).
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setAuthInitialTab('login');
                    setIsAuthOpen(true);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Iniciar Sesión como Admin
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'api' && (
          <ApiExplorer />
        )}

        {activeTab === 'database' && (
          <DatabaseMonitor />
        )}

        {activeTab === 'soc' && (
          <SocConsole
            events={events}
            stats={stats}
            webhookConfig={webhookConfig}
            onUpdateWebhook={handleUpdateWebhook}
            onTestWebhook={handleTestWebhook}
            onSimulateScenario={handleSimulateScenario}
            onClearEvents={handleClearEvents}
            onRefreshEvents={fetchEvents}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Login & Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={user => {
          setCurrentUser(user);
          try {
            sessionStorage.setItem('edusec_session_user', JSON.stringify(user));
          } catch {
            // ignore
          }
          fetchEvents();
          fetchUsers();
          fetchEnrollments();
        }}
        onRegisterSuccess={user => {
          setCurrentUser(user);
          try {
            sessionStorage.setItem('edusec_session_user', JSON.stringify(user));
          } catch {
            // ignore
          }
          fetchUsers();
          fetchEvents();
          fetchEnrollments();
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Futuristic Cyber Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">EDUSEC LMS</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Banco de Pruebas y Telemetría SOC (Proyecto Capstone)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Stack: React 19 + Express REST + InMemory DB + SIEM Buffer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
