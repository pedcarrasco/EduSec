import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, AlertCircle, CheckCircle2, UserPlus, KeyRound, Sparkles, Building } from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (user: User) => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  initialTab = 'login'
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Ciberseguridad');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.consecutiveFailures) {
          setFailedAttempts(data.consecutiveFailures);
        }
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          department: department.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      setSuccessNotice('¡Cuenta institucional creada y registrada en auditoría SOC!');
      setTimeout(() => {
        onRegisterSuccess(data.user);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetUser = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMsg(null);
  };

  const handleSimulateBadPassword = () => {
    setPassword('wrong_pwd_' + Math.floor(Math.random() * 9999));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Campus EduSec - Acceso Unificado</h3>
              <p className="text-xs text-slate-400">Todos los accesos y fallos se auditan para el SOC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center transition ${
              tab === 'login'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Iniciar Sesión (Login)
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center transition ${
              tab === 'register'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Crear Cuenta (Registro)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                {failedAttempts > 0 && (
                  <p className="text-[11px] text-rose-600 mt-0.5 font-mono">
                    Intentos fallidos consecutivos: {failedAttempts} (Evento T1110 registrado)
                  </p>
                )}
              </div>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {/* Quick Preset Accounts */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Acceso Rápido / Credenciales de Prueba:
                  </span>
                  <span className="text-[10px] text-indigo-600 font-mono font-semibold">
                    Admin: EduSec
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] max-h-48 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setPresetUser('EduSec', 'MartiJaviCabo')}
                    className="p-1.5 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 rounded text-left truncate font-semibold text-indigo-900 col-span-2 flex items-center justify-between"
                  >
                    <span>🔑 Admin EduSec (MartiJaviCabo)</span>
                    <span className="text-[9px] font-mono bg-indigo-600 text-white px-1.5 py-0.5 rounded">Recomendado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('auditor.soc@edusec.local', 'soc2026!')}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left truncate font-medium text-slate-800"
                  >
                    🛡️ Auditor SOC (soc2026!)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('prof.garcia@edusec.local', 'profe123')}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left truncate font-medium text-slate-800"
                  >
                    👨‍🏫 Prof. García (profe123)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('prof.valenzuela@edusec.local', 'profe123')}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left truncate font-medium text-slate-800"
                  >
                    👩‍🏫 Prof. Valenzuela (profe123)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('alumno.martin@edusec.local', 'alumno123')}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left truncate font-medium text-slate-800"
                  >
                    🎓 Alumno Martín (alumno123)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('alumno.benjamin@edusec.local', 'alumno123')}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left truncate font-medium text-slate-800"
                  >
                    🎓 Alumno Benjamín (alumno123)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Usuario o Correo Institucional</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="EduSec o usuario@edusec.local"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-medium">Contraseña</label>
                  <button
                    type="button"
                    onClick={handleSimulateBadPassword}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold underline"
                    title="Cargar contraseña errónea para generar evento de login fallido en el SOC"
                  >
                    Simular Contraseña Inválida (Test SOC)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Contraseña (ej: MartiJaviCabo)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition"
              >
                {isLoading ? 'Autenticando...' : 'Iniciar Sesión (Auditado)'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Roberto Gómez"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Correo Institucional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nombre@edusec.local"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Rol Académico</label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
                  >
                    <option value="student">student (Alumno)</option>
                    <option value="professor">professor (Profesor)</option>
                    <option value="soc_auditor">soc_auditor (Auditor SOC)</option>
                    <option value="admin">admin (Administrador TI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Departamento</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Ciberseguridad"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition"
              >
                {isLoading ? 'Registrando...' : 'Crear Cuenta (Auditoría SOC)'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
