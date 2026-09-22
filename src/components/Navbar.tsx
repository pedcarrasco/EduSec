import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckSquare,
  Users,
  ShieldAlert,
  LogIn,
  LogOut,
  KeyRound,
  ChevronDown,
  Sparkles,
  Terminal,
  Database,
  Activity,
  Cpu
} from 'lucide-react';
import { User } from '../types';

export type NavTabType = 'courses' | 'enrollments' | 'users' | 'api' | 'database' | 'soc';

interface NavbarProps {
  currentUser: User | null;
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenAuth: (defaultTab?: 'login' | 'register') => void;
  onOpenPasswordModal: () => void;
  onLogout: () => void;
  onQuickSwitchUser: (email: string) => void;
  criticalAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenPasswordModal,
  onLogout,
  onQuickSwitchUser,
  criticalAlertCount
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-mono">Admin IT</span>;
      case 'professor':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-mono">Profesor</span>;
      case 'soc_auditor':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-mono">Auditor SOC</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">Alumno</span>;
    }
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-40 shadow-2xl">
      {/* Top Cyber Telemetry Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="font-bold tracking-wider text-[10px] uppercase">SOC Telemetry Link: Activo</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <Database className="w-3 h-3 text-sky-400" />
            <span className="text-[10px]">DB Engine: InMemory Relational Cache (0.00ms)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded">
            CAPSTONE SOC LAB
          </span>
          <span className="text-slate-500 hidden md:inline text-[10px]">
            MITRE ATT&amp;CK Matrix Enabled
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('courses')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition border border-indigo-400/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white font-sans">EduSec</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    LMS + SOC
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 -mt-0.5 font-sans">
                  Plataforma de Cursos &amp; Banco de Telemetría SIEM
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 font-sans">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'courses'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cursos</span>
            </button>

            <button
              onClick={() => setActiveTab('enrollments')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'enrollments'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Inscripciones</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuarios</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'api'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-sky-300 hover:bg-sky-950/40 border border-sky-900/40'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Explorador API</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'database'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Base de Datos</span>
            </button>

            <button
              onClick={() => setActiveTab('soc')}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'soc'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-rose-300 hover:bg-rose-950/50 border border-rose-800/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Consola SOC</span>
              {criticalAlertCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {criticalAlertCount}
                </span>
              )}
            </button>
          </nav>

          {/* Medium screens compact nav */}
          <nav className="hidden md:flex xl:hidden items-center gap-1 font-sans">
            <button
              onClick={() => setActiveTab('courses')}
              className={`p-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'courses' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Cursos"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`p-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'enrollments' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Inscripciones"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`p-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Usuarios"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`p-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'api' ? 'bg-sky-600 text-white' : 'text-sky-300 hover:bg-slate-800'
              }`}
              title="Explorador API"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`p-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'database' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-slate-800'
              }`}
              title="Base de Datos"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('soc')}
              className={`p-2 rounded-lg text-xs font-semibold relative transition ${
                activeTab === 'soc' ? 'bg-rose-600 text-white' : 'text-rose-300 hover:bg-slate-800'
              }`}
              title="Consola SOC"
            >
              <ShieldAlert className="w-4 h-4" />
              {criticalAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
          </nav>

          {/* User Profile / Quick Identity Switcher */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs transition"
                >
                  <div className="text-left">
                    <div className="font-semibold text-white leading-tight flex items-center gap-1.5">
                      <span>{currentUser.name.split(' ')[0]}</span>
                      {getRoleBadge(currentUser.role)}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px] font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{currentUser.email}</p>
                      <p className="text-[10px] text-indigo-400 font-semibold mt-1">
                        Depto: {currentUser.department || 'Campus General'}
                      </p>
                    </div>

                    {/* Quick Identity Switcher for Capstone Testing */}
                    <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        Cambio Rápido de Identidad:
                      </span>
                      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        <button
                          onClick={() => {
                            onQuickSwitchUser('EduSec');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>🔑 Admin TI (EduSec)</span>
                          <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 rounded">admin</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('prof.garcia@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>👨‍🏫 Prof. Dr. Carlos García (SOC-101)</span>
                          <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 rounded">profe</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('prof.valenzuela@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>👩‍🏫 Prof. MSc. Elena Valenzuela (FOR-201)</span>
                          <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 rounded">profe</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('prof.alarcon@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>👨‍🏫 Prof. Dr. Fernando Alarcón (SEC-305)</span>
                          <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 rounded">profe</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('prof.miranda@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>👩‍🏫 Prof. Dra. Gabriela Miranda (SIEM-402)</span>
                          <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 rounded">profe</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('alumno.martin@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>🎓 Alumno Martín Silva (SOC-101)</span>
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 rounded">alumno</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('alumno.santiago@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>🎓 Alumno Santiago Morales (FOR-201)</span>
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 rounded">alumno</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('alumno.benjamin@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>🎓 Alumno Benjamín Torres (SEC-305)</span>
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 rounded">alumno</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('alumno.joaquin@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>🎓 Alumno Joaquín Paredes (SIEM-402)</span>
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 rounded">alumno</span>
                        </button>

                        <button
                          onClick={() => {
                            onQuickSwitchUser('auditor.soc@edusec.local');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-[11px] font-medium text-slate-200 flex items-center justify-between transition"
                        >
                          <span>🛡️ Equipo Auditor SOC</span>
                          <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 rounded">auditor</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenPasswordModal();
                        }}
                        className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center gap-2"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cambiar Mi Contraseña</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition items-center gap-1.5"
                >
                  <span>Crear Cuenta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 py-2 text-[11px]">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'courses' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Cursos</span>
        </button>

        <button
          onClick={() => setActiveTab('enrollments')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'enrollments' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Progreso</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'users' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'api' ? 'text-sky-400' : 'text-slate-400'}`}
        >
          <Terminal className="w-4 h-4" />
          <span>API</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'database' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          <Database className="w-4 h-4" />
          <span>DB</span>
        </button>

        <button
          onClick={() => setActiveTab('soc')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'soc' ? 'text-rose-400' : 'text-slate-400'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>SOC</span>
        </button>
      </div>
    </header>
  );
};
