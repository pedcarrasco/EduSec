import React, { useState } from 'react';
import {
  X,
  UserPlus,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Key,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Building,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: User) => void;
  defaultRole?: UserRole;
  currentUserEmail?: string;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  defaultRole = 'student',
  currentUserEmail = 'admin@edusec.local'
}) => {
  if (!isOpen) return null;

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(
    defaultRole === 'professor'
      ? 'Docencia & Ciberseguridad Defensiva'
      : 'Grado en Seguridad de la Información'
  );
  const [password, setPassword] = useState('EduSec2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'professor') {
      setDepartment('Docencia & Ciberseguridad Defensiva');
      if (!email || email.includes('alumno.')) {
        setEmail('prof.' + (name ? name.toLowerCase().replace(/\s+/g, '.') : 'docente') + '@edusec.local');
      }
    } else if (newRole === 'student') {
      setDepartment('Grado en Seguridad de la Información');
      if (!email || email.includes('prof.')) {
        setEmail('alumno.' + (name ? name.toLowerCase().replace(/\s+/g, '.') : 'estudiante') + '@edusec.local');
      }
    } else if (newRole === 'admin') {
      setDepartment('Dirección de TI & Seguridad');
    } else {
      setDepartment('Centro de Operaciones de Seguridad (SOC)');
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!email || email.endsWith('@edusec.local')) {
      const sanitized = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '.');
      if (sanitized) {
        const prefix = role === 'professor' ? 'prof.' : role === 'student' ? 'alumno.' : '';
        setEmail(`${prefix}${sanitized}@edusec.local`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          department: department.trim(),
          password,
          adminEmail: currentUserEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al dar de alta el usuario');
      }

      setSuccessMsg(`¡${role === 'professor' ? 'Profesor' : 'Alumno'} registrado exitosamente!`);
      setTimeout(() => {
        onUserCreated(data.user);
        onClose();
        setName('');
        setEmail('');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              role === 'professor'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : role === 'student'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            }`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Alta de Usuario en el Directorio
              </h3>
              <p className="text-xs text-slate-400">
                Registra un nuevo Alumno o Profesor con credenciales académicas activas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role selector chips */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-2 uppercase">
              Tipo de Identidad / Perfil Académico
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  role === 'student'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">Alumno</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Inscripción y avance</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('professor')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  role === 'professor'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-xs">Profesor</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Crea cursos y temarios</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('soc_auditor')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  role === 'soc_auditor'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">Auditor SOC</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">SIEM &amp; Auditoría</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  role === 'admin'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Admin TI</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Acceso total al LMS</span>
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                Nombre Completo y Título
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder={role === 'professor' ? 'Dr. Roberto Mendoza' : 'Camila Soto'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                Correo Institucional EduSec
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === 'professor' ? 'prof.mendoza@edusec.local' : 'alumno.camila@edusec.local'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Departamento o Especialidad
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Especialidad / Carrera"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  Contraseña Inicial Provisoria
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SOC Telemetry Context Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auditoría SIEM Automática (MITRE ATT&amp;CK T1136.001)</span>
            </div>
            <p className="text-slate-400 text-[10px]">
              La creación de este usuario será registrada en la base de datos y forwardeada a la Consola SOC como evento <code className="text-emerald-400">ACCOUNT_CREATED</code> con severidad {role === 'professor' || role === 'admin' ? 'MEDIUM (Cuenta Privilegiada)' : 'LOW (Alumno)'}.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !email.trim()}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-lg ${
                role === 'professor'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Registrando...' : `Registrar ${role === 'professor' ? 'Profesor' : 'Alumno'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
