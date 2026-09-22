import React, { useState } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Clock,
  Layers,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';
import { Course, User, Enrollment } from '../types';
import { ModifyCourseModal } from './ModifyCourseModal';
import { CreateCourseModal } from './CreateCourseModal';

interface CourseCatalogProps {
  courses: Course[];
  currentUser: User | null;
  enrollments: Enrollment[];
  onEnroll: (courseId: string) => Promise<void>;
  onCourseUpdated: (course: Course) => void;
  onCourseCreated: (course: Course) => void;
  onDeleteCourse: (courseId: string) => Promise<void>;
  isLoading: boolean;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  currentUser,
  enrollments,
  onEnroll,
  onCourseUpdated,
  onCourseCreated,
  onDeleteCourse,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Modals state
  const [courseToModify, setCourseToModify] = useState<Course | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);

  // Enrolling state indicator
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const categories = ['all', 'Seguridad Defensiva', 'Forense Digital', 'Seguridad Ofensiva & DevSecOps', 'Herramientas SIEM'];

  const filteredCourses = courses.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesLvl = selectedLevel === 'all' || c.level === selectedLevel;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.instructorName.toLowerCase().includes(q);
    return matchesCat && matchesLvl && matchesSearch;
  });

  const handleEnrollClick = async (courseId: string) => {
    setEnrollingCourseId(courseId);
    try {
      await onEnroll(courseId);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const isAlreadyEnrolled = (courseId: string) => {
    if (!currentUser) return false;
    return enrollments.some(e => e.courseId === courseId && e.studentId === currentUser.id && e.status !== 'cancelled');
  };

  const isProfOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'professor';

  return (
    <div className="space-y-6">
      {/* Modify Course Modal */}
      <ModifyCourseModal
        isOpen={courseToModify !== null}
        onClose={() => setCourseToModify(null)}
        course={courseToModify}
        onCourseUpdated={onCourseUpdated}
        currentUserEmail={currentUser?.email}
      />

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCourseCreated={onCourseCreated}
        currentUserEmail={currentUser?.email}
        currentUserName={currentUser?.name}
      />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30">
              CATÁLOGO ACADÉMICO 2026
            </span>
            <span className="text-xs text-slate-400">Total: {courses.length} Cursos Activos</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Programas Académicos &amp; Cursos de Ciberseguridad
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Explora las asignaturas disponibles, inscríbete y revisa el temario. Todas las inscripciones y modificaciones de temario se envían como eventos clasificados a la consola del SOC.
          </p>
        </div>

        {isProfOrAdmin && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Crear Nuevo Curso</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, título, profesor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Categoría:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>

        <div className="w-full md:w-44">
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Todos los Niveles</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCourses.map(course => {
          const enrolled = isAlreadyEnrolled(course.id);
          const isFull = course.enrolledCount >= course.capacity;
          const pctCapacity = course.capacity > 0 ? Math.round((course.enrolledCount / course.capacity) * 100) : 100;
          const isSyllabusExpanded = expandedSyllabusId === course.id;

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                {/* Card Top Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                      {course.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {course.level}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium">
                    {course.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Instructor & Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">Prof. {course.instructorName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{course.durationHours} horas ({course.modulesCount} módulos)</span>
                  </div>
                </div>

                {/* Capacity & Quota Bar */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      Cupos de Alumnos:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {course.enrolledCount} / {course.capacity} ({pctCapacity}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pctCapacity >= 100
                          ? 'bg-rose-500'
                          : pctCapacity > 75
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, pctCapacity)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enrolled Students list */}
                {(() => {
                  const courseEnrollments = enrollments.filter(
                    e => e.courseId === course.id && e.status !== 'cancelled'
                  );
                  return (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Alumnos Asignados ({courseEnrollments.length}/4):
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          1 Profesor / 4 Alumnos
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {courseEnrollments.map(enr => (
                          <div
                            key={enr.id}
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] flex items-center justify-between gap-1"
                          >
                            <span className="truncate font-medium text-slate-700">
                              {enr.studentName}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-emerald-600 font-semibold">
                              {enr.progressPercentage}%
                            </span>
                          </div>
                        ))}
                        {courseEnrollments.length === 0 && (
                          <span className="text-[11px] text-slate-400 italic col-span-2">
                            Sin alumnos asignados
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Expandable Syllabus Accordion */}
                <div>
                  <button
                    onClick={() => setExpandedSyllabusId(isSyllabusExpanded ? null : course.id)}
                    className="w-full py-1.5 text-slate-600 hover:text-indigo-600 text-xs font-semibold flex items-center justify-between border-t border-slate-100 pt-2 transition"
                  >
                    <span>Temario de Lecciones ({course.lessons?.length || 4} temas)</span>
                    {isSyllabusExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isSyllabusExpanded && (
                    <div className="mt-2 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs animate-in fade-in">
                      {course.lessons && course.lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="flex items-start gap-2 py-1 border-b border-slate-150 last:border-none">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{lesson.title}</p>
                            <p className="text-[11px] text-slate-500">{lesson.summary} ({lesson.durationMinutes} min)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {isProfOrAdmin && (
                    <button
                      onClick={() => setCourseToModify(course)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                      title="Modificar curso (Genera evento en SOC)"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Modificar Curso</span>
                    </button>
                  )}

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar curso [${course.code}]? Esta acción genera alerta en el SOC.`)) {
                          onDeleteCourse(course.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar curso (Auditado para SOC)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  {enrolled ? (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Inscrito</span>
                    </span>
                  ) : isFull ? (
                    <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Cupos Agotados</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnrollClick(course.id)}
                      disabled={enrollingCourseId === course.id}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{enrollingCourseId === course.id ? 'Inscribiendo...' : 'Inscribirme al Curso'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
