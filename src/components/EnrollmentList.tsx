import React, { useState } from 'react';
import {
  CheckSquare,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Enrollment, Course, User } from '../types';

interface EnrollmentListProps {
  enrollments: Enrollment[];
  courses: Course[];
  currentUser: User | null;
  onUpdateProgress: (enrollmentId: string, completedLessonIds: string[]) => Promise<void>;
  onCancelEnrollment: (enrollmentId: string) => Promise<void>;
  onNavigateToCatalog: () => void;
  isLoading: boolean;
}

export const EnrollmentList: React.FC<EnrollmentListProps> = ({
  enrollments,
  courses,
  currentUser,
  onUpdateProgress,
  onCancelEnrollment,
  onNavigateToCatalog,
  isLoading
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter enrollments: students see their own, professors/admins see all
  const displayedEnrollments =
    currentUser?.role === 'admin' || currentUser?.role === 'professor'
      ? enrollments
      : enrollments.filter(e => e.studentId === currentUser?.id || e.studentEmail === currentUser?.email);

  const handleToggleLesson = async (enrollment: Enrollment, lessonId: string) => {
    const isCompleted = enrollment.completedLessonIds.includes(lessonId);
    const newCompleted = isCompleted
      ? enrollment.completedLessonIds.filter(id => id !== lessonId)
      : [...enrollment.completedLessonIds, lessonId];

    setUpdatingId(enrollment.id);
    try {
      await onUpdateProgress(enrollment.id, newCompleted);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold border border-emerald-500/30">
              EXPEDIENTE ACADÉMICO &amp; AVANCE
            </span>
            <span className="text-xs text-slate-400">
              {currentUser?.role === 'admin' || currentUser?.role === 'professor'
                ? 'Vista Administrativa: Todas las inscripciones'
                : `Alumno: ${currentUser?.name}`}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Inscripciones &amp; Progreso en Cursos
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monitorea el avance de tus asignaturas, marca las lecciones concluidas en tiempo real y gestiona tus inscripciones curriculares. Cada avance genera un evento auditado de telemetría.
          </p>
        </div>

        <button
          onClick={onNavigateToCatalog}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0"
        >
          <span>Explorar Más Cursos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {displayedEnrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">No hay inscripciones registradas</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Actualmente no tienes cursos activos. Dirígete al catálogo para seleccionar e inscribirte en un programa de ciberseguridad.
            </p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ver Catálogo de Cursos</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedEnrollments.map(enr => {
            const course = courses.find(c => c.id === enr.courseId);
            const isCompleted = enr.progressPercentage >= 100;
            const isCancelled = enr.status === 'cancelled';

            return (
              <div
                key={enr.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                        {enr.courseCode}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{enr.courseTitle}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>Estudiante: <strong className="text-slate-700">{enr.studentName}</strong> ({enr.studentEmail})</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Inscrito el {new Date(enr.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCancelled ? (
                      <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg">
                        Inscripción Cancelada
                      </span>
                    ) : isCompleted ? (
                      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>¡Curso Completado!</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                        En Progreso
                      </span>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Confirmas cancelar la inscripción al curso [${enr.courseCode}]? (Se notificará al SOC)`)) {
                            onCancelEnrollment(enr.id);
                          }
                        }}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Cancelar inscripción"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Avance de Aprendizaje:
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {enr.progressPercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : enr.progressPercentage > 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${enr.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Interactive Lessons Checklist */}
                {course && course.lessons && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Temario &amp; Marcado de Progreso de Lecciones:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.lessons.map(lesson => {
                        const completed = enr.completedLessonIds.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            disabled={isCancelled || updatingId === enr.id}
                            onClick={() => handleToggleLesson(enr, lesson.id)}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                              completed
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                                : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                            }`}
                          >
                            <div className="mt-0.5">
                              {completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <div className="w-4 h-4 rounded border border-slate-300 bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${completed ? 'line-through text-emerald-800' : 'text-slate-900'}`}>
                                {lesson.title}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                {lesson.summary} ({lesson.durationMinutes} min)
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
