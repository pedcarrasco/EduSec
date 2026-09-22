import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, Code2, Send, Database, ShieldAlert, BookOpen, UserCheck, ArrowRight, CornerDownRight } from 'lucide-react';

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Cursos (Requisito API)' | 'Inscripciones & Progreso' | 'Autenticación & Eventos SOC' | 'Base de Datos & Telemetría';
  title: string;
  description: string;
  socImpact: string;
  defaultParams?: Record<string, string>;
  defaultBody?: Record<string, any>;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'get-courses',
    method: 'GET',
    path: '/api/courses',
    category: 'Cursos (Requisito API)',
    title: 'Listar Cursos Académicos',
    description: 'Obtiene el catálogo completo de asignaturas con filtros opcionales de búsqueda, categoría y nivel.',
    socImpact: 'Actividad normal de navegación académica (Auditado como INFO)',
    defaultParams: { category: 'all', level: 'all', search: '' }
  },
  {
    id: 'post-course',
    method: 'POST',
    path: '/api/courses',
    category: 'Cursos (Requisito API)',
    title: 'Publicar Nuevo Curso',
    description: 'Crea una nueva asignatura en la base de datos con temario modular, lecciones y cupos asignados.',
    socImpact: 'Evento COURSE_CREATED (MITRE T1078 - Valid Accounts)',
    defaultBody: {
      code: 'CLOUD-301',
      title: 'Seguridad en Arquitecturas Cloud AWS & GCP',
      description: 'Protección de cargas de trabajo en la nube, hardening de contenedores e IAM.',
      category: 'Cloud Security',
      instructorName: 'Dr. Carlos García',
      instructorEmail: 'prof.garcia@edusec.local',
      capacity: 25,
      level: 'Avanzado',
      durationHours: 40,
      modulesCount: 5,
      lessons: [
        { id: 'les-cloud-1', title: 'Hardening de Buckets y Políticas IAM', durationMinutes: 50, summary: 'Políticas de mínimo privilegio' },
        { id: 'les-cloud-2', title: 'VPC Flow Logs y Detección de Anomalías', durationMinutes: 60, summary: 'Análisis forense en red cloud' }
      ]
    }
  },
  {
    id: 'patch-course',
    method: 'PATCH',
    path: '/api/courses/course-1',
    category: 'Cursos (Requisito API)',
    title: 'Modificar Curso (Evento Crítico SOC)',
    description: 'Actualiza cupos, estado o temario del curso. Monitoreado para alertar manipulaciones o sabotajes.',
    socImpact: 'Evento COURSE_MODIFIED (MITRE T1565.001 - Stored Data Manipulation)',
    defaultBody: {
      capacity: 45,
      reason: 'Aumento extraordinario de vacantes por alta demanda de alumnos',
      modifiedBy: 'prof.garcia@edusec.local'
    }
  },
  {
    id: 'delete-course',
    method: 'DELETE',
    path: '/api/courses/course-5',
    category: 'Cursos (Requisito API)',
    title: 'Eliminar Curso del Catálogo',
    description: 'Elimina de forma permanente un curso de la base de datos académica.',
    socImpact: 'Evento COURSE_DELETED (MITRE T1485 - Data Destruction)',
    defaultBody: {
      adminEmail: 'admin@edusec.local'
    }
  },
  {
    id: 'post-enroll',
    method: 'POST',
    path: '/api/courses/course-1/enroll',
    category: 'Inscripciones & Progreso',
    title: 'Inscribir Estudiante a Curso',
    description: 'Registra a un estudiante en una asignatura verificando cupos disponibles y genera su expediente.',
    socImpact: 'Evento COURSE_ENROLLED (MITRE T1078 - Control de Vacantes)',
    defaultBody: {
      studentEmail: 'alumno.martin@edusec.local',
      studentName: 'Martín Silva'
    }
  },
  {
    id: 'post-progress',
    method: 'POST',
    path: '/api/enrollments/enr-1/progress',
    category: 'Inscripciones & Progreso',
    title: 'Actualizar Progreso de Lecciones',
    description: 'Calcula el nuevo porcentaje de completitud conforme el estudiante avanza en el contenido del curso.',
    socImpact: 'Evento PROGRESS_UPDATED (Auditoría formativa y de expediente)',
    defaultBody: {
      completedLessonIds: ['les-soc-1', 'les-soc-2']
    }
  },
  {
    id: 'post-login',
    method: 'POST',
    path: '/api/auth/login',
    category: 'Autenticación & Eventos SOC',
    title: 'Autenticar Usuario (Login)',
    description: 'Valida credenciales de acceso. Dispara alerta de fuerza bruta al acumular 4+ intentos fallidos.',
    socImpact: 'LOGIN_SUCCESS / LOGIN_FAILED / BRUTE_FORCE_DETECTED (MITRE T1110.001)',
    defaultBody: {
      email: 'admin@edusec.local',
      password: 'admin123'
    }
  },
  {
    id: 'post-password',
    method: 'POST',
    path: '/api/auth/change-password',
    category: 'Autenticación & Eventos SOC',
    title: 'Cambio de Contraseña de Usuario',
    description: 'Actualiza la clave institucional en la base de datos tras verificar la credencial previa.',
    socImpact: 'Evento PASSWORD_CHANGED (MITRE T1098 - Account Manipulation)',
    defaultBody: {
      userId: 'usr-prof-1',
      currentPassword: 'profesor123',
      newPassword: 'NuevaContraseñaSegura2026!'
    }
  },
  {
    id: 'post-user',
    method: 'POST',
    path: '/api/users',
    category: 'Autenticación & Eventos SOC',
    title: 'Alta de Alumno o Profesor (Crear Cuenta)',
    description: 'Registra una nueva cuenta de Alumno, Profesor o Auditor en el directorio institucional con auditoría SIEM.',
    socImpact: 'Evento ACCOUNT_CREATED (MITRE T1136.001 - Create Account: Local Account)',
    defaultBody: {
      name: 'Dra. Andrea Morales',
      email: 'prof.morales@edusec.local',
      role: 'professor',
      department: 'Criptografía & Seguridad en Redes',
      password: 'EduSec2026!'
    }
  },
  {
    id: 'delete-user',
    method: 'DELETE',
    path: '/api/users/usr-temp-1',
    category: 'Autenticación & Eventos SOC',
    title: 'Baja de Usuario del Directorio',
    description: 'Elimina de forma permanente una cuenta de alumno o profesor del directorio institucional.',
    socImpact: 'Evento ACCOUNT_DELETED / ADMIN_ACTION (MITRE T1531 - Account Access Removal)',
    defaultBody: {
      adminEmail: 'admin@edusec.local'
    }
  },
  {
    id: 'get-events',
    method: 'GET',
    path: '/api/events',
    category: 'Base de Datos & Telemetría',
    title: 'Consultar Telemetría Forense del SOC',
    description: 'Obtiene los registros estructurados de seguridad con IPs de origen, User-Agents y mapeo MITRE.',
    socImpact: 'Monitoreo SIEM / Trazabilidad forense centralizada',
    defaultParams: { limit: '25', severity: 'HIGH' }
  },
  {
    id: 'get-db-status',
    method: 'GET',
    path: '/api/db/status',
    category: 'Base de Datos & Telemetría',
    title: 'Inspeccionar Estado de la Base de Datos',
    description: 'Verifica la integridad de las colecciones, recuento de tuplas, latencia y memoria utilizada.',
    socImpact: 'Monitoreo de Infraestructura y Base de Datos (Auditado)',
    defaultParams: {}
  }
];

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [customPath, setCustomPath] = useState<string>(ENDPOINTS[0].path);
  const [bodyText, setBodyText] = useState<string>(
    ENDPOINTS[0].defaultBody ? JSON.stringify(ENDPOINTS[0].defaultBody, null, 2) : ''
  );

  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<'curl' | 'python' | 'json' | null>(null);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setCustomPath(ep.path);
    setBodyText(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseStatus(null);
    setResponsePayload(null);
    setLatencyMs(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponsePayload(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (selectedEndpoint.method !== 'GET' && bodyText.trim()) {
        try {
          // validate json
          JSON.parse(bodyText);
          options.body = bodyText;
        } catch {
          alert('El cuerpo de la petición no tiene un formato JSON válido.');
          setIsLoading(false);
          return;
        }
      }

      const res = await fetch(customPath, options);
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setResponseStatus(res.status);

      const headersObj: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
      setResponseHeaders(headersObj);

      const data = await res.json().catch(() => null);
      setResponsePayload(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponsePayload({ error: err.message || 'Error de red al invocar el endpoint' });
      setLatencyMs(Math.round(performance.now() - start));
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlSnippet = () => {
    const origin = window.location.origin;
    if (selectedEndpoint.method === 'GET') {
      return `curl -X GET "${origin}${customPath}" \\
  -H "Accept: application/json"`;
    }
    const cleanBody = bodyText.replace(/"/g, '\\"').replace(/\n/g, ' ');
    return `curl -X ${selectedEndpoint.method} "${origin}${customPath}" \\
  -H "Content-Type: application/json" \\
  -d "${cleanBody}"`;
  };

  const getPythonSnippet = () => {
    const origin = window.location.origin;
    if (selectedEndpoint.method === 'GET') {
      return `import requests

url = "${origin}${customPath}"
response = requests.get(url)
print(response.status_code)
print(response.json())`;
    }
    return `import requests

url = "${origin}${customPath}"
payload = ${bodyText || '{}'}
headers = {"Content-Type": "application/json"}

response = requests.${selectedEndpoint.method.toLowerCase()}(url, json=payload, headers=headers)
print(response.status_code)
print(response.json())`;
  };

  const handleCopy = (text: string, type: 'curl' | 'python' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const categories = Array.from(new Set(ENDPOINTS.map(e => e.category)));

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">GET</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>;
      case 'PATCH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PATCH</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">DELETE</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>EduSec RESTful API Engine v2.4 (OpenAPI Compatible)</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Explorador y Consola Interactiva de API
            </h2>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Módulo de prueba en vivo para evaluar y demostrar la API requerida para el proyecto. Cada petición interactúa con la base de datos real del servidor y alimenta la telemetría del SOC.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-right">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Endpoints Documentados</span>
              <span className="text-xl font-mono font-bold text-indigo-400">{ENDPOINTS.length}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-right">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Formato Salida</span>
              <span className="text-xl font-mono font-bold text-emerald-400">JSON / UTF-8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar List + Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider block">
              Catálogo de Endpoints
            </span>

            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {categories.map(cat => (
                <div key={cat} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase font-mono px-2 py-0.5 flex items-center gap-1.5">
                    <CornerDownRight className="w-3 h-3 text-indigo-400" />
                    <span>{cat}</span>
                  </div>

                  <div className="space-y-1">
                    {ENDPOINTS.filter(e => e.category === cat).map(ep => {
                      const isSelected = selectedEndpoint.id === ep.id;
                      return (
                        <button
                          key={ep.id}
                          onClick={() => handleSelectEndpoint(ep)}
                          className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500/50 text-white shadow-sm'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <div className="truncate flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              {getMethodBadge(ep.method)}
                              <span className="text-xs font-semibold truncate">{ep.title}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 truncate block">
                              {ep.path}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Execution & Inspection Workspace */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  {getMethodBadge(selectedEndpoint.method)}
                  <h3 className="text-base font-bold text-white">{selectedEndpoint.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedEndpoint.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono">
                  {selectedEndpoint.socImpact}
                </span>
              </div>
            </div>

            {/* Request Bar */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400">
                Línea de Petición HTTP
              </label>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="px-3 py-1 bg-slate-900 font-mono font-bold text-xs rounded text-indigo-300 border border-slate-700">
                  {selectedEndpoint.method}
                </span>
                <input
                  type="text"
                  value={customPath}
                  onChange={e => setCustomPath(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-xs text-white focus:outline-none px-2"
                />
                <button
                  onClick={handleExecuteRequest}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold font-mono uppercase flex items-center gap-2 shadow-md transition shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isLoading ? 'Ejecutando...' : 'Ejecutar Test'}</span>
                </button>
              </div>
            </div>

            {/* Request Body Editor (if not GET) */}
            {selectedEndpoint.method !== 'GET' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-400">
                    Cuerpo de la Petición (Payload JSON)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">application/json</span>
                </div>
                <textarea
                  rows={6}
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  className="w-full bg-slate-950 font-mono text-xs text-indigo-200 p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>
            )}

            {/* Quick Export / Code Snippets */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-400 text-[11px]">
                Snippets para Evaluadores:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(getCurlSnippet(), 'curl')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition"
                >
                  {copiedType === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copiar cURL</span>
                </button>
                <button
                  onClick={() => handleCopy(getPythonSnippet(), 'python')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition"
                >
                  {copiedType === 'python' ? <Check className="w-3 h-3 text-emerald-400" /> : <Code2 className="w-3 h-3" />}
                  <span>Copiar Python</span>
                </button>
              </div>
            </div>

            {/* Response Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-400">
                    Respuesta del Servidor
                  </label>
                  {responseStatus && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        responseStatus >= 200 && responseStatus < 300
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : responseStatus >= 400
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      HTTP {responseStatus}
                    </span>
                  )}
                  {latencyMs !== null && (
                    <span className="text-[11px] font-mono text-slate-500">
                      ({latencyMs} ms)
                    </span>
                  )}
                </div>

                {responsePayload && (
                  <button
                    onClick={() => handleCopy(JSON.stringify(responsePayload, null, 2), 'json')}
                    className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedType === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Respuesta</span>
                  </button>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[160px] max-h-[380px] overflow-auto font-mono text-xs text-slate-300">
                {isLoading ? (
                  <div className="flex items-center justify-center h-28 text-slate-500 gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Invocando endpoint y registrando telemetría en el SOC...</span>
                  </div>
                ) : responsePayload ? (
                  <pre className="leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(responsePayload, null, 2)}
                  </pre>
                ) : (
                  <div className="text-slate-600 flex flex-col items-center justify-center h-28 space-y-1">
                    <Send className="w-5 h-5 opacity-40" />
                    <span>Haz clic en &quot;Ejecutar Test&quot; para enviar la petición a la API</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
