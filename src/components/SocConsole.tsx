import React, { useState } from 'react';
import {
  ShieldAlert,
  Terminal,
  Activity,
  Download,
  Send,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Flame,
  Globe,
  Lock,
  Server,
  FileCode,
  Copy,
  Check,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { SecurityEvent, SOCStats, SOCWebhookConfig, EventSeverity, EventType } from '../types';
import { EventDetailModal } from './EventDetailModal';

interface SocConsoleProps {
  events: SecurityEvent[];
  stats: SOCStats | null;
  webhookConfig: SOCWebhookConfig;
  onUpdateWebhook: (config: Partial<SOCWebhookConfig>) => Promise<void>;
  onTestWebhook: () => Promise<{ success: boolean; message: string }>;
  onSimulateScenario: (scenario: string) => Promise<void>;
  onClearEvents: () => Promise<void>;
  onRefreshEvents: () => void;
  isLoading: boolean;
}

export const SocConsole: React.FC<SocConsoleProps> = ({
  events,
  stats,
  webhookConfig,
  onUpdateWebhook,
  onTestWebhook,
  onSimulateScenario,
  onClearEvents,
  onRefreshEvents,
  isLoading
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'stream' | 'simulator' | 'export' | 'webhook'>('stream');

  // Filters for Live Stream
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingEvent, setInspectingEvent] = useState<SecurityEvent | null>(null);

  // Webhook form state
  const [webhookUrl, setWebhookUrl] = useState(webhookConfig.url || '');
  const [webhookEnabled, setWebhookEnabled] = useState(webhookConfig.enabled || false);
  const [webhookFormat, setWebhookFormat] = useState<'json' | 'cef' | 'syslog'>(webhookConfig.format || 'json');
  const [webhookMinSev, setWebhookMinSev] = useState<EventSeverity>(webhookConfig.minSeverity || 'LOW');
  const [webhookAuth, setWebhookAuth] = useState(webhookConfig.customAuthHeader || '');
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [testWebhookResult, setTestWebhookResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Simulation state
  const [simulatingScenario, setSimulatingScenario] = useState<string | null>(null);
  const [simulationSuccessMsg, setSimulationSuccessMsg] = useState<string | null>(null);

  // Export copy feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Filtered Events
  const filteredEvents = events.filter(e => {
    const matchesSev = selectedSeverity === 'all' || e.severity === selectedSeverity;
    const matchesType = selectedType === 'all' || e.eventType === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      e.action.toLowerCase().includes(q) ||
      e.sourceIp.includes(q) ||
      (e.actor.email && e.actor.email.toLowerCase().includes(q)) ||
      e.eventType.toLowerCase().includes(q) ||
      (e.mitreAttack && e.mitreAttack.techniqueId.toLowerCase().includes(q));
    return matchesSev && matchesType && matchesSearch;
  });

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWebhook(true);
    try {
      await onUpdateWebhook({
        url: webhookUrl.trim(),
        enabled: webhookEnabled,
        format: webhookFormat,
        minSeverity: webhookMinSev,
        customAuthHeader: webhookAuth.trim() || undefined
      });
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleRunWebhookTest = async () => {
    setIsTestingWebhook(true);
    setTestWebhookResult(null);
    try {
      const res = await onTestWebhook();
      setTestWebhookResult(res);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleTriggerSimulation = async (scenario: string, name: string) => {
    setSimulatingScenario(scenario);
    setSimulationSuccessMsg(null);
    try {
      await onSimulateScenario(scenario);
      setSimulationSuccessMsg(`¡Escenario "${name}" inyectado exitosamente en el bus de telemetría del SOC!`);
      setTimeout(() => setSimulationSuccessMsg(null), 4000);
    } finally {
      setSimulatingScenario(null);
    }
  };

  const handleExportDownload = (format: 'json' | 'cef' | 'syslog') => {
    window.location.href = `/api/soc/export?format=${format}`;
  };

  const handleCopySample = async (format: 'cef' | 'syslog' | 'json') => {
    if (events.length === 0) return;
    const sample = events[0];
    let text = '';
    if (format === 'json') {
      text = JSON.stringify(events.slice(0, 5), null, 2);
    } else if (format === 'cef') {
      text = `CEF:0|EduSec|CoursePlatform|1.0|${sample.eventType}|${sample.action}|8|src=${sample.sourceIp} suser=${sample.actor.email || 'anon'} msg=${JSON.stringify(sample.details)}`;
    } else {
      text = `<131>1 ${sample.timestamp} edusec.campus edusec - ${sample.id} [edusec@32473 ip="${sample.sourceIp}"] ${sample.action}`;
    }

    navigator.clipboard.writeText(text);
    setCopyFeedback(format);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getSeverityPill = (sev: EventSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded">LOW</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40 rounded">INFO</span>;
    }
  };

  const getEventTypeName = (type: EventType) => {
    switch (type) {
      case 'ACCOUNT_CREATED': return 'Creación de Cuenta';
      case 'LOGIN_FAILED': return 'Login Fallido';
      case 'LOGIN_SUCCESS': return 'Inicio de Sesión';
      case 'PASSWORD_CHANGED': return 'Cambio de Contraseña';
      case 'COURSE_ENROLLED': return 'Inscripción a Curso';
      case 'ENROLLMENT_CANCELLED': return 'Cancelación Inscripción';
      case 'COURSE_CREATED': return 'Creación de Curso';
      case 'COURSE_MODIFIED': return 'Modificación de Curso';
      case 'COURSE_DELETED': return 'Eliminación de Curso';
      case 'PROGRESS_UPDATED': return 'Avance de Progreso';
      case 'ADMIN_ACTION': return 'Acción Administrativa';
      case 'BRUTE_FORCE_DETECTED': return 'Fuerza Bruta Detectada';
      case 'PRIVILEGE_ESCALATION_ATTEMPT': return 'Intento de Escalada';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Detail Modal */}
      <EventDetailModal event={inspectingEvent} onClose={() => setInspectingEvent(null)} />

      {/* Hero Header */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                TELEMETRY BUS: ACTIVE (EDUSEC LMS)
              </span>
              <span className="text-xs text-slate-400 font-mono">MITRE ATT&amp;CK V14.1</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Consola de Operaciones de Seguridad (SOC) &amp; Telemetría LMS
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Monitor central de eventos de ciberseguridad para pruebas de tu SOC (Capstone). Registra inicios de sesión, cambios de contraseña, inscripciones, modificaciones de cursos y ataques en formatos CEF, Syslog o Webhook.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefreshEvents}
              disabled={isLoading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-2 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Actualizar Logs</span>
            </button>

            <button
              onClick={onClearEvents}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800/50 transition flex items-center gap-1.5"
              title="Vaciar buffer de eventos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Buffer</span>
            </button>
          </div>
        </div>

        {/* SOC KPIs Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Eventos</span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">
              {stats?.totalEvents || events.length}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-amber-500 block">Logins Fallidos</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
              {stats?.failedLogins || 0}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-rose-500 block">Alertas Críticas</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block">
              {stats?.criticalAlerts || 0}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-indigo-400 block">Modif. Cursos</span>
            <span className="text-xl font-bold font-mono text-indigo-300 mt-0.5 block">
              {stats?.courseModifications || 0}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-emerald-400 block">Inscripciones</span>
            <span className="text-xl font-bold font-mono text-emerald-300 mt-0.5 block">
              {stats?.enrollmentsCount || 0}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block">Webhook SOC</span>
            <span className="text-xs font-bold font-mono text-cyan-300 mt-1 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${webhookConfig.enabled ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
              {webhookConfig.enabled ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubtab('stream')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeSubtab === 'stream'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Logs en Vivo ({filteredEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubtab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeSubtab === 'simulator'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Simulador de Ataques para Pruebas del SOC</span>
        </button>

        <button
          onClick={() => setActiveSubtab('export')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeSubtab === 'export'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar SIEM (CEF / Syslog / JSON)</span>
        </button>

        <button
          onClick={() => setActiveSubtab('webhook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeSubtab === 'webhook'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" />
          <span>Reenvío Webhook hacia tu Servidor SOC</span>
        </button>
      </div>

      {/* 1. LIVE STREAM TAB */}
      {activeSubtab === 'stream' && (
        <div className="space-y-4">
          {/* Stream Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por IP, usuario, curso, MITRE..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Severidad:</span>
              {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                    selectedSeverity === sev
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="w-full md:w-52">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Todos los Eventos</option>
                <option value="LOGIN_SUCCESS">Inicio de Sesión (Login)</option>
                <option value="LOGIN_FAILED">Login Fallido</option>
                <option value="PASSWORD_CHANGED">Cambio de Contraseña</option>
                <option value="COURSE_ENROLLED">Inscripción a Curso</option>
                <option value="ENROLLMENT_CANCELLED">Cancelación Inscripción</option>
                <option value="COURSE_CREATED">Creación de Curso</option>
                <option value="COURSE_MODIFIED">Modificación de Curso</option>
                <option value="COURSE_DELETED">Eliminación de Curso</option>
                <option value="PROGRESS_UPDATED">Progreso de Lección</option>
                <option value="ADMIN_ACTION">Acción Administrativa</option>
                <option value="BRUTE_FORCE_DETECTED">Fuerza Bruta Detectada</option>
                <option value="PRIVILEGE_ESCALATION_ATTEMPT">Intento de Escalada</option>
              </select>
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Hora</th>
                    <th className="py-3 px-4">Severidad</th>
                    <th className="py-3 px-4">Tipo Evento</th>
                    <th className="py-3 px-4">Acción / Descripción</th>
                    <th className="py-3 px-4">Actor / IP Origen</th>
                    <th className="py-3 px-4">MITRE ATT&amp;CK</th>
                    <th className="py-3 px-4 text-right">Forense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No hay eventos que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map(evt => (
                      <tr
                        key={evt.id}
                        className="hover:bg-slate-900/50 transition cursor-pointer"
                        onClick={() => setInspectingEvent(evt)}
                      >
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {getSeverityPill(evt.severity)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-slate-200 font-semibold">
                            {getEventTypeName(evt.eventType)}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                          {evt.action}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                          <span className="text-indigo-400 font-bold block">{evt.sourceIp}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[130px] block">
                            {evt.actor.email || 'Anónimo'}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {evt.mitreAttack ? (
                            <span className="inline-block px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-700/50 rounded text-[10px]">
                              {evt.mitreAttack.techniqueId}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setInspectingEvent(evt);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                            title="Inspeccionar payload forense completo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTACK SIMULATOR TAB FOR SOC CAPSTONE TESTING */}
      {activeSubtab === 'simulator' && (
        <div className="space-y-4">
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-5 text-amber-200 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>Simulador de Escenarios de Prueba para Reglas del SOC</span>
            </div>
            <p className="mt-1 text-slate-300 leading-relaxed">
              Dispara ataques reales simulados contra la plataforma de cursos para comprobar si tus reglas de detección (en Wazuh, Splunk, Elastic, QRadar o scripts de correlación) disparan las alertas y casos de respuesta adecuados en tu proyecto Capstone.
            </p>
          </div>

          {simulationSuccessMsg && (
            <div className="p-4 bg-emerald-900/30 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{simulationSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scenario 1: Brute Force against Professor/Admin Account */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded">
                  MITRE T1110.001 - Credential Access
                </span>
                <span className="text-xs font-bold text-rose-600">Severidad: HIGH</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                1. Fuerza Bruta contra Cuenta de Administrador
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inyecta una ráfaga de 7 intentos de inicio de sesión fallidos continuos utilizando diccionarios automáticos de contraseñas desde la IP anómala 185.220.101.44.
              </p>
              <button
                onClick={() => handleTriggerSimulation('BRUTE_FORCE', 'Fuerza Bruta contra Admin')}
                disabled={simulatingScenario !== null}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-2"
              >
                {simulatingScenario === 'BRUTE_FORCE' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Flame className="w-3.5 h-3.5" />
                )}
                <span>Ejecutar Ataque de Fuerza Bruta (Login)</span>
              </button>
            </div>

            {/* Scenario 2: Privilege Escalation Student -> Admin */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">
                  MITRE T1068 - Privilege Escalation
                </span>
                <span className="text-xs font-bold text-purple-600">Severidad: CRITICAL</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                2. Intento de Escalada de Privilegios (IDOR / BOLA)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simula una llamada forzada a la API de roles de usuario desde la sesión de un alumno para auto-asignarse permisos de Administrador del Campus.
              </p>
              <button
                onClick={() => handleTriggerSimulation('PRIVILEGE_ESCALATION', 'Escalada de Privilegios')}
                disabled={simulatingScenario !== null}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-2"
              >
                {simulatingScenario === 'PRIVILEGE_ESCALATION' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>Ejecutar Intento de Escalada</span>
              </button>
            </div>

            {/* Scenario 3: Course Tampering */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">
                  MITRE T1565.001 - Stored Data Manipulation
                </span>
                <span className="text-xs font-bold text-amber-600">Severidad: HIGH</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                3. Modificación y Sabotaje Malicioso de Cursos
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modificación sospechosa no autorizada de temario, forzando la reducción de cupos a 0 y archivado intempestivo del curso SOC-101 para provocar denegación de servicio académico.
              </p>
              <button
                onClick={() => handleTriggerSimulation('COURSE_TAMPERING', 'Alteración Maliciosa de Curso')}
                disabled={simulatingScenario !== null}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-2"
              >
                {simulatingScenario === 'COURSE_TAMPERING' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
                <span>Ejecutar Modificación Maliciosa</span>
              </button>
            </div>

            {/* Scenario 4: Mass Scraping / DoS on Enrollments */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                  MITRE T1499 - Endpoint Denial of Service
                </span>
                <span className="text-xs font-bold text-blue-600">Severidad: MEDIUM</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                4. Ráfaga Masiva de Inscripciones (Scraping / Agotamiento)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inyección de múltiples solicitudes concurrentes de inscripción automatizada (Botnet Scrapy) destinadas a agotar los cupos de los cursos en segundos.
              </p>
              <button
                onClick={() => handleTriggerSimulation('MASS_SCRAPING_ENROLLMENT', 'Ráfaga de Inscripciones')}
                disabled={simulatingScenario !== null}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-2"
              >
                {simulatingScenario === 'MASS_SCRAPING_ENROLLMENT' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Server className="w-3.5 h-3.5" />
                )}
                <span>Ejecutar Ráfaga de Inscripciones</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIEM EXPORTER TAB */}
      {activeSubtab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900">Exportación de Logs para Ingesta SIEM</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Descarga los eventos generados por la plataforma educativa para importarlos en tu entorno local de Wazuh, Elastic Stack (Logstash/Filebeat), Splunk o ArcSight, o cópialos en el formato que requiera tu analizador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CEF Export */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">CEF (ArcSight / Splunk)</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">.cef</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Formato Common Event Format compatible con reglas de correlación de Splunk y Micro Focus ArcSight.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportDownload('cef')}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar CEF
                </button>
                <button
                  onClick={() => handleCopySample('cef')}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                  title="Copiar muestra CEF"
                >
                  {copyFeedback === 'cef' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Syslog Export */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Syslog RFC 5424</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">.log</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mensajes de Syslog estructurados estándar con headers PRI y SD-IDs, listos para rsyslog o syslog-ng.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportDownload('syslog')}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Syslog
                </button>
                <button
                  onClick={() => handleCopySample('syslog')}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                  title="Copiar muestra Syslog"
                >
                  {copyFeedback === 'syslog' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* JSON Export */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">JSON / Elastic ECS</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">.json</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Array JSON estructurado con todos los campos normalizados, actores, MITRE ATT&amp;CK y red.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportDownload('json')}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar JSON
                </button>
                <button
                  onClick={() => handleCopySample('json')}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                  title="Copiar muestra JSON"
                >
                  {copyFeedback === 'json' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. WEBHOOK FORWARDER CONFIG TAB */}
      {activeSubtab === 'webhook' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-2xl">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>Conector en Tiempo Real (SIEM Forwarder)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Reenvío Automático de Telemetría a tu Servidor SOC
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Si tu equipo tiene un colector HTTP (por ejemplo un webhook de Discord/Slack para alertas de incidentes, o un endpoint HTTP Event Collector de Splunk/Elastic), configúralo aquí para recibir cada evento en vivo.
            </p>
          </div>

          {testWebhookResult && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                testWebhookResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testWebhookResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{testWebhookResult.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveWebhook} className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <input
                id="webhook-enable-toggle"
                type="checkbox"
                checked={webhookEnabled}
                onChange={e => setWebhookEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="webhook-enable-toggle" className="font-semibold text-slate-800 cursor-pointer">
                Habilitar reenvío activo por Webhook hacia el SOC
              </label>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                URL del Endpoint Colector (HTTP POST)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://mi-soc.dominio.com/api/v1/alerts o https://webhook.site/..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Formato de Envío</label>
                <select
                  value={webhookFormat}
                  onChange={e => setWebhookFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="json">JSON (Payload Estructurado)</option>
                  <option value="cef">CEF (Common Event Format)</option>
                  <option value="syslog">Syslog RFC 5424</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Severidad Mínima para Alerta</label>
                <select
                  value={webhookMinSev}
                  onChange={e => setWebhookMinSev(e.target.value as EventSeverity)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="INFO">INFO (Todos los eventos)</option>
                  <option value="LOW">LOW o superior</option>
                  <option value="MEDIUM">MEDIUM o superior</option>
                  <option value="HIGH">HIGH o superior (Recomendado)</option>
                  <option value="CRITICAL">Solo CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Header de Autorización Opcional (Bearer Token / API Key)
              </label>
              <input
                type="text"
                value={webhookAuth}
                onChange={e => setWebhookAuth(e.target.value)}
                placeholder="Bearer eyJhbGciOi... o Splunk 8492-492..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleRunWebhookTest}
                disabled={isTestingWebhook || !webhookUrl}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                {isTestingWebhook ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Probar Envío (Ping SOC)</span>
              </button>

              <button
                type="submit"
                disabled={isSavingWebhook}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                {isSavingWebhook ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
