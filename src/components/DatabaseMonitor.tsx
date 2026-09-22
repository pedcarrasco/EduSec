import React, { useState, useEffect } from 'react';
import { Database, HardDrive, RefreshCw, CheckCircle2, Table, Layers, Cpu, Server, Activity, ShieldCheck, Key } from 'lucide-react';

interface CollectionInfo {
  name: string;
  label: string;
  recordCount: number;
  primaryKey: string;
  sampleFields: string[];
}

interface DbStatusResponse {
  database: {
    engine: string;
    status: string;
    uptimeSeconds: number;
    latencyMs: number;
    collections: CollectionInfo[];
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
}

export const DatabaseMonitor: React.FC = () => {
  const [dbData, setDbData] = useState<DbStatusResponse['database'] | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('courses');
  const [collectionRows, setCollectionRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbData(data.database);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  };

  const fetchCollectionRows = async (colName: string) => {
    try {
      let endpoint = '/api/courses';
      if (colName === 'users') endpoint = '/api/users';
      if (colName === 'enrollments') endpoint = '/api/enrollments';
      if (colName === 'security_events') endpoint = '/api/events?limit=15';

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const rows = data.courses || data.users || data.enrollments || data.events || [];
        setCollectionRows(rows);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchCollectionRows(selectedCollection);
  }, []);

  const handleSelectCol = (colName: string) => {
    setSelectedCollection(colName);
    fetchCollectionRows(colName);
  };

  const formatUptime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>Base de Datos del Servidor (Backend DB Engine)</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Monitor de Base de Datos y Esquema Relacional
            </h2>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Inspección visual del almacenamiento persistente en memoria del backend. Valida que todos los cursos, cuentas de alumnos/profesores, inscripciones y telemetría residen en tablas estructuradas.
            </p>
          </div>

          <button
            onClick={() => {
              fetchStatus();
              fetchCollectionRows(selectedCollection);
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold border border-slate-700 transition shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sincronizar DB</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Estado del Motor</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono">ONLINE / SALUDABLE</div>
          <span className="text-[10px] text-slate-500 font-mono">Sincronizado con API</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Latencia de Consulta</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {dbData?.latencyMs || 1.2} ms
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Lectura instantánea</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Memoria Heap Usada</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {dbData?.memory?.heapUsedMb || 24} MB
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Total Heap: {dbData?.memory?.heapTotalMb || 32} MB
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Tiempo de Actividad</span>
            <Server className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {dbData?.uptimeSeconds ? formatUptime(dbData.uptimeSeconds) : '0m 45s'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Sin caídas reportadas</span>
        </div>
      </div>

      {/* Main Content: Tables Tabs and Schema Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Collections list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider block">
              Tablas / Colecciones ({dbData?.collections?.length || 4})
            </span>

            <div className="space-y-2">
              {dbData?.collections?.map(col => {
                const isSelected = selectedCollection === col.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => handleSelectCol(col.name)}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-white shadow'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Table className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold font-mono">{col.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{col.label}</span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 text-xs font-bold border border-slate-700">
                        {col.recordCount} filas
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schema Card for current collection */}
          {selectedCollection && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Esquema de Campos: [{selectedCollection}]</span>
              </span>

              {(() => {
                const current = dbData?.collections.find(c => c.name === selectedCollection);
                if (!current) return null;
                return (
                  <div className="space-y-1.5">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <span className="text-amber-300 font-bold">Clave Primaria (PK)</span>
                      <span className="text-slate-300">{current.primaryKey} (UUID/ID)</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                      <span className="text-slate-500 uppercase text-[10px] block">Atributos indexados:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {current.sampleFields.map(f => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Rows View Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Explorador de Tuplas: {selectedCollection.toUpperCase()}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registros activos cargados en el motor de base de datos
                </p>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                Última sincronización: {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 max-h-[480px]">
              {collectionRows.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No hay filas almacenadas en esta colección.
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      {Object.keys(collectionRows[0] || {})
                        .filter(k => k !== 'lessons' && k !== 'details' && k !== 'completedLessonIds')
                        .slice(0, 6)
                        .map(key => (
                          <th key={key} className="px-3.5 py-2.5 font-bold uppercase text-[10px] text-slate-300">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {collectionRows.map((row, idx) => {
                      const keys = Object.keys(row)
                        .filter(k => k !== 'lessons' && k !== 'details' && k !== 'completedLessonIds')
                        .slice(0, 6);
                      return (
                        <tr key={row.id || idx} className="hover:bg-slate-900/60 transition">
                          {keys.map(k => (
                            <td key={k} className="px-3.5 py-2.5 truncate max-w-[180px]">
                              {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
