import React, { useState, useEffect } from 'react';
import { X, BookOpen, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, User, Users, Flame } from 'lucide-react';
import { Course } from '../types';

interface ModifyCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onCourseUpdated: (updated: Course) => void;
  currentUserEmail?: string;
}

export const ModifyCourseModal: React.FC<ModifyCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  onCourseUpdated,
  currentUserEmail = 'profesor@edusec.local'
}) => {
  if (!isOpen || !course) return null;

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [category, setCategory] = useState(course.category);
  const [capacity, setCapacity] = useState(course.capacity);
  const [instructorName, setInstructorName] = useState(course.instructorName);
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>(course.status);
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>(course.level);
  const [reason, setReason] = useState('Actualización ordinaria de contenidos curriculares');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setCategory(course.category);
      setCapacity(course.capacity);
      setInstructorName(course.instructorName);
      setStatus(course.status);
      setLevel(course.level);
      setErrorMsg(null);
      setSuccessNotice(null);
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          capacity: Number(capacity),
          instructorName: instructorName.trim(),
          status,
          level,
          reason: reason.trim(),
          modifiedBy: currentUserEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al modificar el curso');
      }

      setSuccessNotice('¡Curso modificado con éxito! Evento [COURSE_MODIFIED] enviado a la telemetría del SOC.');
      setTimeout(() => {
        onCourseUpdated(data.course);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de comunicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateTampering = () => {
    setTitle(`[ALTERADO] ${course.title} (Deshabilitado no autorizado)`);
    setCapacity(0);
    setStatus('archived');
    setReason('Prueba de ataque de denegación académica / Modificación no autorizada de temario y cupos');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-400">{course.code}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                  {course.enrolledCount} alumnos inscritos
                </span>
              </div>
              <h3 className="font-bold text-sm text-white truncate max-w-xs">{course.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-start justify-between gap-2">
            <div>
              <span className="font-bold text-indigo-900 block text-[11px]">
                Auditoría SIEM: Evento de Modificación de Cursos
              </span>
              <p className="text-slate-600 text-[10px] mt-0.5">
                Cualquier cambio a la estructura o cupos de este curso generará un registro con firma MITRE ATT&amp;CK T1565.001.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSimulateTampering}
              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow transition flex items-center gap-1 shrink-0"
              title="Cargar alteración de alta severidad para prueba del SOC"
            >
              <Flame className="w-3 h-3" />
              <span>Test Alteración SOC</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Título del Curso</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Descripción Académica</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Profesor / Instructor</label>
              <input
                type="text"
                required
                value={instructorName}
                onChange={e => setInstructorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cupos / Capacidad Máxima</label>
              <input
                type="number"
                required
                min={0}
                max={200}
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Estado del Curso</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
              >
                <option value="active">Activo (Abierto a Inscripciones)</option>
                <option value="draft">Borrador (Oculto)</option>
                <option value="archived">Archivado / Cerrado</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nivel del Curso</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-xs"
              >
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Motivo o Justificación del Cambio (Registrado en Auditoría)
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ej. Ampliación de cupos por alta demanda"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold shadow transition"
            >
              {isLoading ? 'Guardando Cambios...' : 'Guardar Modificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
