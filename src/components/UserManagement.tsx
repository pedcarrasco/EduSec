import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldAlert,
  Search,
  Filter,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Award,
  UserPlus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';
import { CreateUserModal } from './CreateUserModal';

interface UserManagementProps {
  users: User[];
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
  onUpdateStatus: (userId: string, newStatus: UserStatus) => Promise<void>;
  onUserCreated?: (user: User) => void;
  onDeleteUser?: (userId: string) => Promise<void>;
  currentUser?: User | null;
  isLoading: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUpdateRole,
  onUpdateStatus,
  onUserCreated,
  onDeleteUser,
  currentUser,
  isLoading
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'all' | 'professors' | 'students' | 'staff'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalDefaultRole, setModalDefaultRole] = useState<UserRole>('student');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const professorsCount = users.filter(u => u.role === 'professor').length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const staffCount = users.filter(u => u.role === 'admin' || u.role === 'soc_auditor').length;
  const lockedCount = users.filter(u => u.status === 'locked' || u.status === 'suspended').length;

  const filteredUsers = users.filter(u => {
    if (activeSubtab === 'professors' && u.role !== 'professor') return false;
    if (activeSubtab === 'students' && u.role !== 'student') return false;
    if (activeSubtab === 'staff' && (u.role !== 'admin' && u.role !== 'soc_auditor')) return false;

    const q = searchQuery.toLowerCase();
    return (
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setActionLoadingId(userId);
    try {
      await onUpdateRole(userId, newRole);
      showNotice(`Rol actualizado a ${newRole.toUpperCase()} (Auditado en SIEM)`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const nextStatus: UserStatus = user.status === 'locked' ? 'active' : 'locked';
    setActionLoadingId(user.id);
    try {
      await onUpdateStatus(user.id, nextStatus);
      showNotice(`Cuenta [${user.email}] ahora está ${nextStatus === 'locked' ? 'BLOQUEADA' : 'ACTIVA'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !onDeleteUser) return;
    const target = userToDelete;
    setActionLoadingId(target.id);
    setUserToDelete(null);
    try {
      await onDeleteUser(target.id);
      showNotice(`Usuario [${target.name}] eliminado del directorio institucional.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const showNotice = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const openCreateModal = (role: UserRole = 'student') => {
    setModalDefaultRole(role);
    setIsCreateModalOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-mono">Admin TI</span>;
      case 'professor':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-mono">Profesor</span>;
      case 'soc_auditor':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono">Auditor SOC</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono">Alumno</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultRole={modalDefaultRole}
        currentUserEmail={currentUser?.email || 'admin@edusec.local'}
        onUserCreated={newUser => {
          if (onUserCreated) onUserCreated(newUser);
          showNotice(`¡${newUser.role === 'professor' ? 'Profesor' : 'Alumno'} "${newUser.name}" registrado con éxito!`);
        }}
      />

      {/* Temporary feedback banner */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{notificationMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            SIEM Synced
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30">
              DIRECTORIO INSTITUCIONAL
            </span>
            <span className="text-xs text-slate-400">Total Usuarios: {users.length}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Gestión de Profesores y Alumnos
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Control de identidades, perfiles académicos y roles de acceso. Permite dar de alta nuevos alumnos o profesores y asociarlos a cursos. Toda alta o cambio de rol genera eventos de auditoría trazables con MITRE ATT&amp;CK en el SOC.
          </p>
        </div>

        {/* Buttons to Add Users */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openCreateModal('student')}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>+ Nuevo Alumno</span>
          </button>

          <button
            onClick={() => openCreateModal('professor')}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>+ Nuevo Profesor</span>
          </button>

          <button
            onClick={() => openCreateModal('student')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Usuario</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-blue-400 block font-bold font-mono">Cuerpo Docente</span>
            <span className="text-lg font-bold text-white font-mono">{professorsCount} Profesores</span>
          </div>
          <BookOpen className="w-5 h-5 text-blue-400/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-emerald-400 block font-bold font-mono">Alumnado Activo</span>
            <span className="text-lg font-bold text-white font-mono">{studentsCount} Alumnos</span>
          </div>
          <GraduationCap className="w-5 h-5 text-emerald-400/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-purple-400 block font-bold font-mono">TI &amp; SOC Staff</span>
            <span className="text-lg font-bold text-white font-mono">{staffCount} Cuentas</span>
          </div>
          <ShieldCheck className="w-5 h-5 text-purple-400/60" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-rose-400 block font-bold font-mono">Bloqueados SIEM</span>
            <span className="text-lg font-bold text-rose-300 font-mono">{lockedCount} Cuentas</span>
          </div>
          <Lock className="w-5 h-5 text-rose-400/60" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubtab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeSubtab === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setActiveSubtab('professors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubtab === 'professors'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3 h-3 text-blue-400" />
            <span>Profesores ({professorsCount})</span>
          </button>
          <button
            onClick={() => setActiveSubtab('students')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubtab === 'students'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-emerald-400" />
            <span>Alumnos ({studentsCount})</span>
          </button>
          <button
            onClick={() => setActiveSubtab('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubtab === 'staff'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>Admin &amp; SOC ({staffCount})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo, área..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-mono font-semibold">
              <tr>
                <th className="py-3 px-4">Usuario / Identidad</th>
                <th className="py-3 px-4">Departamento / Especialidad</th>
                <th className="py-3 px-4">Rol en el LMS</th>
                <th className="py-3 px-4">Estado Cuenta</th>
                <th className="py-3 px-4">Intentos Fallidos</th>
                <th className="py-3 px-4 text-right">Acciones de Cuenta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-mono">
                    No se encontraron usuarios en esta categoría.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.role === 'professor' && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">Docente</span>
                        )}
                        {u.role === 'student' && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">Estudiante</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{u.department || 'Campus General'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        <select
                          disabled={actionLoadingId === u.id}
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="text-[11px] bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 font-mono"
                        >
                          <option value="student">student (Alumno)</option>
                          <option value="professor">professor (Profesor)</option>
                          <option value="soc_auditor">soc_auditor (Auditor)</option>
                          <option value="admin">admin (Administrador)</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {u.status === 'active' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-mono">
                          Bloqueada
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {u.failedLoginCount > 0 ? (
                        <span className="text-rose-400 font-bold">
                          {u.failedLoginCount} fallos
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={actionLoadingId === u.id}
                          onClick={() => handleStatusToggle(u)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition border flex items-center gap-1.5 ${
                            u.status === 'locked'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                          }`}
                        >
                          {u.status === 'locked' ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Desbloquear</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Bloquear</span>
                            </>
                          )}
                        </button>

                        {onDeleteUser && u.role !== 'admin' && u.email !== 'EduSec' && u.email !== 'admin@edusec.local' && (
                          <button
                            disabled={actionLoadingId === u.id}
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition border border-transparent hover:border-rose-900/50"
                            title={`Eliminar cuenta de ${u.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-app Delete Confirmation Modal (Safe for iframes) */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Confirmar Eliminación?</h3>
                <p className="text-xs text-slate-400">Esta acción será auditada en el SIEM del SOC.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <p className="font-semibold text-white">{userToDelete.name}</p>
              <p className="text-slate-400 font-mono text-[11px]">{userToDelete.email}</p>
              <p className="text-indigo-400 font-medium">
                Rol: {userToDelete.role.toUpperCase()} • Depto: {userToDelete.department || 'N/A'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoadingId === userToDelete.id}
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-900/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={(newUser) => {
            if (onUserCreated) onUserCreated(newUser);
            showNotice(`¡Cuenta creada con éxito para ${newUser.name} (${newUser.role})!`);
          }}
          defaultRole={modalDefaultRole}
          currentUserEmail={currentUser?.email || 'admin@edusec.local'}
        />
      )}
    </div>
  );
};
