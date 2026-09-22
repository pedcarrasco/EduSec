import React, { useState } from 'react';
import { X, ShieldAlert, Copy, Check, Terminal, ExternalLink, Globe, Cpu, Clock, Key } from 'lucide-react';
import { SecurityEvent } from '../types';

interface EventDetailModalProps {
  event: SecurityEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded">CRITICAL (Nivel 10)</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">HIGH (Nivel 8)</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded">MEDIUM (Nivel 5)</span>;
      case 'LOW':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded">LOW (Nivel 3)</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40 rounded">INFO (Nivel 1)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-sm text-white">{event.id}</h3>
                {getSeverityBadge(event.severity)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{event.action}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] font-mono uppercase block">Timestamp</span>
              <span className="font-mono text-slate-300">{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-mono uppercase block">IP de Origen</span>
              <span className="font-mono text-indigo-300 font-semibold">{event.sourceIp}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-mono uppercase block">Método / Ruta</span>
              <span className="font-mono text-emerald-400">{event.httpMethod} {event.endpoint}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-mono uppercase block">Estado HTTP</span>
              <span className="font-mono text-amber-300 font-bold">{event.httpStatus} ({event.outcome})</span>
            </div>
          </div>

          {/* Actor & Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider">Actor / Identidad</span>
              <div className="font-medium text-slate-200">{event.actor.email || 'Anónimo / No autenticado'}</div>
              <div className="text-slate-400 text-[11px]">Rol: {event.actor.role || 'Sin rol'}</div>
              <div className="text-slate-500 text-[10px] truncate max-w-xs">UA: {event.userAgent}</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">Objetivo / Recurso</span>
              <div className="font-medium text-slate-200">{event.target.name || event.target.type}</div>
              <div className="text-slate-400 text-[11px]">Tipo: {event.target.type}</div>
              {event.target.id && <div className="text-slate-500 text-[10px] font-mono">ID: {event.target.id}</div>}
            </div>
          </div>

          {/* MITRE ATT&CK Mapping */}
          {event.mitreAttack && (
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-wider">
                  Mapeo MITRE ATT&amp;CK Framework
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  Táctica: {event.mitreAttack.tactic}
                </span>
              </div>
              <div className="font-mono text-sm text-indigo-200 font-bold">
                {event.mitreAttack.techniqueId} — {event.mitreAttack.techniqueName}
              </div>
            </div>
          )}

          {/* Forensic Payload JSON */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Detalle Forense (Structured Payload)
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar JSON'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48 leading-tight">
              {JSON.stringify(event.details, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {event.forwardedToWebhook ? '✓ Reenviado al Webhook SOC' : 'Almacenado localmente en buffer'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Cerrar Inspección
          </button>
        </div>
      </div>
    </div>
  );
};
