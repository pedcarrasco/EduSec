import React, { useState, useEffect } from 'react';
import { X, PlusCircle, BookOpen, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { Course, User } from '../types';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
  currentUserEmail?: string;
  currentUserName?: string;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
  currentUserEmail = 'profesor@edusec.local',
  currentUserName = 'Profesor Académico'
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('CYBER-202');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Seguridad Defensiva');
  const [capacity, setCapacity] = useState(30);
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [durationHours, setDurationHours] = useState(36);
  const [modulesCount, setModulesCount] = useState(4);
  const [instructorName, setInstructorName] = useState(currentUserName);
  const [instructorEmail, setInstructorEmail] = useState(currentUserEmail);
  const [professorsList, setProfessorsList] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/professors')
      .then(res => res.json())
      .then(data => {
        if (data.professors && data.professors.length > 0) {
          setProfessorsList(data.professors);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectProfessor = (profEmail: string) => {
    const found = professorsList.find(p => p.email === profEmail);
    if (found) {
      setInstructorName(found.name);
      setInstructorEmail(found.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          description: description.trim(),
          category,
          capacity: Number(capacity),
          level,
          durationHours: Number(durationHours),
          modulesCount: Number(modulesCount),
          instructorName: instructorName.trim(),
          instructorEmail: currentUserEmail,
          lessons: [
            { id: `les-${Date.now()}-1`, title: 'Fundamentos y marco conceptual', durationMinutes: 45, summary: 'Bases teóricas' },
            { id: `les-${Date.now()}-2`, title: 'Laboratorio práctico de despliegue', durationMinutes: 60, summary: 'Entorno de pruebas' },
            { id: `les-${Date.now()}-3`, title: 'Análisis de casos reales y amenazas', durationMinutes: 50, summary: 'Casuística' },
            { id: `les-${Date.now()}-4`, title: 'Evaluación y proyecto final', durationMinutes: 45, summary: 'Entrega evaluada' }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear curso');
      }

      setSuccessNotice('¡Curso creado exitosamente y registrado en la auditoría!');
      setTimeout(() => {
        onCourseCreated(data.course);
        onClose();
        setTitle('');
        setDescription('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Crear Nuevo Curso Académico</h3>
              <p className="text-[11px] text-slate-400">Publicación en catálogo y registro en auditoría SOC</p>
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Código</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="SEC-201"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Título del Curso</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Hardening de Servidores Linux"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Descripción</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción del programa y competencias a desarrollar..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="Seguridad Defensiva">Seguridad Defensiva</option>
                <option value="Forense Digital">Forense Digital</option>
                <option value="Seguridad Ofensiva & DevSecOps">Seguridad Ofensiva &amp; DevSecOps</option>
                <option value="Herramientas SIEM">Herramientas SIEM</option>
                <option value="Redes y Criptografía">Redes y Criptografía</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                <span>Profesor Responsable</span>
                {professorsList.length > 0 && (
                  <span className="text-[10px] text-indigo-600 font-normal">
                    {professorsList.length} profesores registrados
                  </span>
                )}
              </label>
              {professorsList.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={instructorEmail}
                    onChange={e => {
                      handleSelectProfessor(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs bg-white"
                  >
                    {professorsList.map(p => (
                      <option key={p.id} value={p.email}>
                        {p.name} ({p.email}) - {p.department || 'Docencia'}
                      </option>
                    ))}
                    <option value="custom">-- Otro profesor (personalizado) --</option>
                  </select>
                  {instructorEmail === 'custom' && (
                    <input
                      type="text"
                      required
                      value={instructorName}
                      onChange={e => setInstructorName(e.target.value)}
                      placeholder="Nombre del nuevo profesor..."
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={instructorName}
                  onChange={e => setInstructorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cupos Máx.</label>
              <input
                type="number"
                min={5}
                max={150}
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nivel</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Duración (Hrs)</label>
              <input
                type="number"
                min={10}
                max={120}
                value={durationHours}
                onChange={e => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
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
              {isLoading ? 'Creando Curso...' : 'Publicar Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
