import fs from 'fs';
import path from 'path';
import {
  User,
  Course,
  Enrollment,
  Lesson,
  SecurityEvent,
  SOCWebhookConfig,
  SOCStats,
  EventSeverity,
  EventType,
  UserRole,
  UserStatus
} from '../src/types';

interface StoredUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  courses: Course[];
  enrollments: Enrollment[];
  events: SecurityEvent[];
  webhookConfig: SOCWebhookConfig;
}

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp/edusec-data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'edusec-db.json');
const BUNDLED_DB_FILE = path.join(process.cwd(), 'data', 'edusec-db.json');

const INITIAL_USERS: StoredUser[] = [
  {
    id: 'usr-admin',
    name: 'Administrador EduSec',
    email: 'EduSec',
    role: 'admin',
    status: 'active',
    passwordHash: 'MartiJaviCabo',
    department: 'Dirección de Tecnología y Ciberseguridad',
    createdAt: '2026-01-10T08:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-prof-1',
    name: 'Dr. Carlos García',
    email: 'prof.garcia@edusec.local',
    role: 'professor',
    status: 'active',
    passwordHash: 'profe123',
    department: 'Ciberseguridad Defensiva & SOC',
    createdAt: '2026-01-15T09:30:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-prof-2',
    name: 'MSc. Elena Valenzuela',
    email: 'prof.valenzuela@edusec.local',
    role: 'professor',
    status: 'active',
    passwordHash: 'profe123',
    department: 'Forense Digital & Ethical Hacking',
    createdAt: '2026-01-20T11:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-prof-3',
    name: 'Dr. Fernando Alarcón',
    email: 'prof.alarcon@edusec.local',
    role: 'professor',
    status: 'active',
    passwordHash: 'profe123',
    department: 'Seguridad Ofensiva & DevSecOps',
    createdAt: '2026-01-24T10:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-prof-4',
    name: 'Dra. Gabriela Miranda',
    email: 'prof.miranda@edusec.local',
    role: 'professor',
    status: 'active',
    passwordHash: 'profe123',
    department: 'Herramientas SIEM & Threat Intelligence',
    createdAt: '2026-01-28T12:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-1',
    name: 'Martín Silva',
    email: 'alumno.martin@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería Informática',
    createdAt: '2026-02-01T14:15:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-2',
    name: 'Lucía Ramos',
    email: 'alumna.lucia@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Telecomunicaciones y Redes',
    createdAt: '2026-02-05T16:40:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-3',
    name: 'Mateo Fernández',
    email: 'alumno.mateo@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería en Ciberseguridad',
    createdAt: '2026-02-07T09:10:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-4',
    name: 'Valentina Castro',
    email: 'alumna.valentina@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Telecomunicaciones y Redes',
    createdAt: '2026-02-09T11:25:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-5',
    name: 'Santiago Morales',
    email: 'alumno.santiago@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería Informática',
    createdAt: '2026-02-10T13:40:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-6',
    name: 'Camila Herrera',
    email: 'alumna.camila@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Auditoría y Seguridad de la Información',
    createdAt: '2026-02-12T15:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-7',
    name: 'Nicolás Romero',
    email: 'alumno.nicolas@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería en Ciberseguridad',
    createdAt: '2026-02-14T08:30:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-8',
    name: 'Sofía Navarro',
    email: 'alumna.sofia@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Telecomunicaciones y Redes',
    createdAt: '2026-02-15T10:15:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-9',
    name: 'Benjamín Torres',
    email: 'alumno.benjamin@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería de Software',
    createdAt: '2026-02-16T12:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-10',
    name: 'Isabella Vargas',
    email: 'alumna.isabella@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Seguridad Informática',
    createdAt: '2026-02-17T14:45:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-11',
    name: 'Lucas Riquelme',
    email: 'alumno.lucas@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería de Redes',
    createdAt: '2026-02-18T16:20:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-12',
    name: 'Florencia Mendoza',
    email: 'alumna.florencia@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería en Ciberseguridad',
    createdAt: '2026-02-19T09:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-13',
    name: 'Joaquín Paredes',
    email: 'alumno.joaquin@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Informática Biomédica & Seguridad',
    createdAt: '2026-02-20T10:30:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-14',
    name: 'Martina Salazar',
    email: 'alumna.martina@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Telecomunicaciones y Redes',
    createdAt: '2026-02-21T11:45:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-15',
    name: 'Tomás Fuentes',
    email: 'alumno.tomas@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Ingeniería en Ciberseguridad',
    createdAt: '2026-02-22T13:15:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-student-16',
    name: 'Constanza Peña',
    email: 'alumna.constanza@edusec.local',
    role: 'student',
    status: 'active',
    passwordHash: 'alumno123',
    department: 'Auditoría de Sistemas',
    createdAt: '2026-02-23T15:00:00Z',
    failedLoginCount: 0
  },
  {
    id: 'usr-auditor-soc',
    name: 'Equipo de Monitoreo SOC',
    email: 'auditor.soc@edusec.local',
    role: 'soc_auditor',
    status: 'active',
    passwordHash: 'soc2026!',
    department: 'Security Operations Center (Capstone)',
    createdAt: '2026-01-05T07:00:00Z',
    failedLoginCount: 0
  }
];

const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'SOC-101',
    title: 'Operación y Detección en SOC Nivel 1',
    description: 'Fundamentos de monitoreo de eventos en tiempo real, triage de alertas, análisis de cabeceras de red y uso de playbooks en centros de operaciones de ciberseguridad.',
    category: 'Seguridad Defensiva',
    instructorId: 'usr-prof-1',
    instructorName: 'Dr. Carlos García',
    instructorEmail: 'prof.garcia@edusec.local',
    capacity: 25,
    enrolledCount: 4,
    level: 'Principiante',
    modulesCount: 4,
    durationHours: 32,
    status: 'active',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-02-10T15:20:00Z',
    lessons: [
      { id: 'les-101-1', title: 'Arquitectura y roles dentro de un SOC moderno', durationMinutes: 45, summary: 'L1, L2, L3, Threat Hunter e Incident Responder.' },
      { id: 'les-101-2', title: 'Taxonomía de eventos de seguridad y severidades', durationMinutes: 50, summary: 'Escalas de impacto, triage inicial y ciclo de vida del incidente.' },
      { id: 'les-101-3', title: 'Lectura e interpretación de Syslog y CEF', durationMinutes: 60, summary: 'Estructura de paquetes RFC 5424 y campos estándar ArcSight.' },
      { id: 'les-101-4', title: 'Mapeo con el framework MITRE ATT&CK', durationMinutes: 55, summary: 'Matriz Enterprise, tácticas, técnicas y submétodos.' }
    ]
  },
  {
    id: 'course-2',
    code: 'FOR-201',
    title: 'Análisis Forense Digital y Respuesta a Incidentes (DFIR)',
    description: 'Procedimientos de preservación de evidencia, adquisición de memoria RAM, análisis de logs de autenticación y cadena de custodia ante ataques informáticos.',
    category: 'Forense Digital',
    instructorId: 'usr-prof-2',
    instructorName: 'MSc. Elena Valenzuela',
    instructorEmail: 'prof.valenzuela@edusec.local',
    capacity: 25,
    enrolledCount: 4,
    level: 'Intermedio',
    modulesCount: 5,
    durationHours: 40,
    status: 'active',
    createdAt: '2026-01-22T12:00:00Z',
    updatedAt: '2026-02-14T09:40:00Z',
    lessons: [
      { id: 'les-201-1', title: 'Cadena de custodia y metodologías ISO/IEC 27037', durationMinutes: 40, summary: 'Principios de no alteración y hashing forense.' },
      { id: 'les-201-2', title: 'Análisis de artefactos en Windows (EVTX y Prefetch)', durationMinutes: 65, summary: 'Event IDs 4624, 4625, 4720 y ejecuciones sospechosas.' },
      { id: 'les-201-3', title: 'Adquisición y triaje en sistemas Linux', durationMinutes: 55, summary: 'Auth.log, wtmp, btmp y conexiones con netstat/ss.' },
      { id: 'les-201-4', title: 'Líneas temporales forenses (Super Timelines)', durationMinutes: 60, summary: 'Correlación de eventos de múltiples fuentes temporales.' }
    ]
  },
  {
    id: 'course-3',
    code: 'SEC-305',
    title: 'Seguridad en Aplicaciones Web & OWASP Top 10',
    description: 'Vulnerabilidades críticas en capas web, inyecciones, control de acceso roto (BOLA/IDOR), seguridad en autenticación API y defensas proactivas.',
    category: 'Seguridad Ofensiva & DevSecOps',
    instructorId: 'usr-prof-3',
    instructorName: 'Dr. Fernando Alarcón',
    instructorEmail: 'prof.alarcon@edusec.local',
    capacity: 25,
    enrolledCount: 4,
    level: 'Avanzado',
    modulesCount: 6,
    durationHours: 48,
    status: 'active',
    createdAt: '2026-01-25T14:30:00Z',
    updatedAt: '2026-02-18T18:10:00Z',
    lessons: [
      { id: 'les-305-1', title: 'Mecanismos de autenticación y ataques de fuerza bruta', durationMinutes: 50, summary: 'Credential stuffing, rate limiting y bloqueos.' },
      { id: 'les-305-2', title: 'Fallos de autorización (Broken Object Level Authorization)', durationMinutes: 60, summary: 'Escalada horizontal y vertical en APIs REST.' },
      { id: 'les-305-3', title: 'Inyección de comandos y SQL Injection', durationMinutes: 70, summary: 'Extracción no autorizada y alteración de tablas.' },
      { id: 'les-305-4', title: 'Seguridad en cabeceras HTTP y protección contra CSRF', durationMinutes: 45, summary: 'CORS, CSP, SameSite cookies y JWT handling.' }
    ]
  },
  {
    id: 'course-4',
    code: 'SIEM-402',
    title: 'Ingesta y Correlación de Reglas en Splunk & Wazuh',
    description: 'Construcción de dashboards analíticos, creación de detectores basados en comportamiento, alertas SIEM y automatización de respuestas SOAR.',
    category: 'Herramientas SIEM',
    instructorId: 'usr-prof-4',
    instructorName: 'Dra. Gabriela Miranda',
    instructorEmail: 'prof.miranda@edusec.local',
    capacity: 25,
    enrolledCount: 4,
    level: 'Avanzado',
    modulesCount: 4,
    durationHours: 36,
    status: 'active',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-20T11:15:00Z',
    lessons: [
      { id: 'les-402-1', title: 'Configuración de agentes y forwarders de telemetría', durationMinutes: 50, summary: 'Ingesta Syslog, HTTP Event Collector y Wazuh agent.' },
      { id: 'les-402-2', title: 'Escritura de reglas de correlación en XML y SPL', durationMinutes: 65, summary: 'Detección de ráfagas de logins fallidos y anomalías.' },
      { id: 'les-402-3', title: 'Mapeo automático a TTPs de MITRE', durationMinutes: 55, summary: 'Enriquecimiento contextual de alertas con threat intel.' },
      { id: 'les-402-4', title: 'Respuesta activa y contención de hosts', durationMinutes: 50, summary: 'Aislamiento de IP y bloqueo automatizado en firewall.' }
    ]
  }
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-101',
    courseId: 'course-1',
    courseTitle: 'Operación y Detección en SOC Nivel 1',
    courseCode: 'SOC-101',
    studentId: 'usr-student-1',
    studentName: 'Martín Silva',
    studentEmail: 'alumno.martin@edusec.local',
    enrolledAt: '2026-02-02T10:00:00Z',
    status: 'active',
    progressPercentage: 50,
    completedLessonIds: ['les-101-1', 'les-101-2'],
    lastAccessedAt: '2026-09-22T08:15:00Z',
    notes: 'Avance regular en módulos teóricos de SOC.'
  },
  {
    id: 'enr-102',
    courseId: 'course-1',
    courseTitle: 'Operación y Detección en SOC Nivel 1',
    courseCode: 'SOC-101',
    studentId: 'usr-student-2',
    studentName: 'Lucía Ramos',
    studentEmail: 'alumna.lucia@edusec.local',
    enrolledAt: '2026-02-05T14:20:00Z',
    status: 'active',
    progressPercentage: 25,
    completedLessonIds: ['les-101-1'],
    lastAccessedAt: '2026-09-21T16:30:00Z',
    notes: 'Completó introducción a roles SOC.'
  },
  {
    id: 'enr-103',
    courseId: 'course-1',
    courseTitle: 'Operación y Detección en SOC Nivel 1',
    courseCode: 'SOC-101',
    studentId: 'usr-student-3',
    studentName: 'Mateo Fernández',
    studentEmail: 'alumno.mateo@edusec.local',
    enrolledAt: '2026-02-08T09:15:00Z',
    status: 'active',
    progressPercentage: 75,
    completedLessonIds: ['les-101-1', 'les-101-2', 'les-101-3'],
    lastAccessedAt: '2026-09-22T11:00:00Z',
    notes: 'Excelente desempeño en lectura de Syslog y CEF.'
  },
  {
    id: 'enr-104',
    courseId: 'course-1',
    courseTitle: 'Operación y Detección en SOC Nivel 1',
    courseCode: 'SOC-101',
    studentId: 'usr-student-4',
    studentName: 'Valentina Castro',
    studentEmail: 'alumna.valentina@edusec.local',
    enrolledAt: '2026-02-10T11:30:00Z',
    status: 'active',
    progressPercentage: 0,
    completedLessonIds: [],
    lastAccessedAt: '2026-09-22T14:00:00Z',
    notes: 'Inscripción reciente. Próxima a iniciar lección 1.'
  },
  {
    id: 'enr-201',
    courseId: 'course-2',
    courseTitle: 'Análisis Forense Digital y Respuesta a Incidentes (DFIR)',
    courseCode: 'FOR-201',
    studentId: 'usr-student-5',
    studentName: 'Santiago Morales',
    studentEmail: 'alumno.santiago@edusec.local',
    enrolledAt: '2026-02-11T10:00:00Z',
    status: 'active',
    progressPercentage: 50,
    completedLessonIds: ['les-201-1', 'les-201-2'],
    lastAccessedAt: '2026-09-22T09:20:00Z',
    notes: 'Completó análisis de artefactos en Windows EVTX.'
  },
  {
    id: 'enr-202',
    courseId: 'course-2',
    courseTitle: 'Análisis Forense Digital y Respuesta a Incidentes (DFIR)',
    courseCode: 'FOR-201',
    studentId: 'usr-student-6',
    studentName: 'Camila Herrera',
    studentEmail: 'alumna.camila@edusec.local',
    enrolledAt: '2026-02-12T13:45:00Z',
    status: 'active',
    progressPercentage: 75,
    completedLessonIds: ['les-201-1', 'les-201-2', 'les-201-3'],
    lastAccessedAt: '2026-09-22T10:15:00Z',
    notes: 'Destacado análisis de triaje en Linux auth.log.'
  },
  {
    id: 'enr-203',
    courseId: 'course-2',
    courseTitle: 'Análisis Forense Digital y Respuesta a Incidentes (DFIR)',
    courseCode: 'FOR-201',
    studentId: 'usr-student-7',
    studentName: 'Nicolás Romero',
    studentEmail: 'alumno.nicolas@edusec.local',
    enrolledAt: '2026-02-14T08:50:00Z',
    status: 'active',
    progressPercentage: 25,
    completedLessonIds: ['les-201-1'],
    lastAccessedAt: '2026-09-21T18:00:00Z',
    notes: 'Completó normas ISO 27037 y hashing forense.'
  },
  {
    id: 'enr-204',
    courseId: 'course-2',
    courseTitle: 'Análisis Forense Digital y Respuesta a Incidentes (DFIR)',
    courseCode: 'FOR-201',
    studentId: 'usr-student-8',
    studentName: 'Sofía Navarro',
    studentEmail: 'alumna.sofia@edusec.local',
    enrolledAt: '2026-02-15T12:10:00Z',
    status: 'active',
    progressPercentage: 100,
    completedLessonIds: ['les-201-1', 'les-201-2', 'les-201-3', 'les-201-4'],
    lastAccessedAt: '2026-09-22T12:30:00Z',
    notes: 'Curso concluido con 100% de avance y super timelines.'
  },
  {
    id: 'enr-301',
    courseId: 'course-3',
    courseTitle: 'Seguridad en Aplicaciones Web & OWASP Top 10',
    courseCode: 'SEC-305',
    studentId: 'usr-student-9',
    studentName: 'Benjamín Torres',
    studentEmail: 'alumno.benjamin@edusec.local',
    enrolledAt: '2026-02-16T14:00:00Z',
    status: 'active',
    progressPercentage: 50,
    completedLessonIds: ['les-305-1', 'les-305-2'],
    lastAccessedAt: '2026-09-22T08:40:00Z',
    notes: 'Prácticas de IDOR y BOLA en APIs REST concluidas.'
  },
  {
    id: 'enr-302',
    courseId: 'course-3',
    courseTitle: 'Seguridad en Aplicaciones Web & OWASP Top 10',
    courseCode: 'SEC-305',
    studentId: 'usr-student-10',
    studentName: 'Isabella Vargas',
    studentEmail: 'alumna.isabella@edusec.local',
    enrolledAt: '2026-02-17T15:30:00Z',
    status: 'active',
    progressPercentage: 75,
    completedLessonIds: ['les-305-1', 'les-305-2', 'les-305-4'],
    lastAccessedAt: '2026-09-22T09:50:00Z',
    notes: 'Dominio de CSP, SameSite cookies y JWT.'
  },
  {
    id: 'enr-303',
    courseId: 'course-3',
    courseTitle: 'Seguridad en Aplicaciones Web & OWASP Top 10',
    courseCode: 'SEC-305',
    studentId: 'usr-student-11',
    studentName: 'Lucas Riquelme',
    studentEmail: 'alumno.lucas@edusec.local',
    enrolledAt: '2026-02-18T17:15:00Z',
    status: 'active',
    progressPercentage: 25,
    completedLessonIds: ['les-305-1'],
    lastAccessedAt: '2026-09-21T20:10:00Z',
    notes: 'Revisando mecanismos de autenticación y rate limiting.'
  },
  {
    id: 'enr-304',
    courseId: 'course-3',
    courseTitle: 'Seguridad en Aplicaciones Web & OWASP Top 10',
    courseCode: 'SEC-305',
    studentId: 'usr-student-12',
    studentName: 'Florencia Mendoza',
    studentEmail: 'alumna.florencia@edusec.local',
    enrolledAt: '2026-02-19T10:20:00Z',
    status: 'active',
    progressPercentage: 100,
    completedLessonIds: ['les-305-1', 'les-305-2', 'les-305-3', 'les-305-4'],
    lastAccessedAt: '2026-09-22T13:00:00Z',
    notes: 'Curso web completado satisfactoriamente.'
  },
  {
    id: 'enr-401',
    courseId: 'course-4',
    courseTitle: 'Ingesta y Correlación de Reglas en Splunk & Wazuh',
    courseCode: 'SIEM-402',
    studentId: 'usr-student-13',
    studentName: 'Joaquín Paredes',
    studentEmail: 'alumno.joaquin@edusec.local',
    enrolledAt: '2026-02-20T11:00:00Z',
    status: 'active',
    progressPercentage: 50,
    completedLessonIds: ['les-402-1', 'les-402-2'],
    lastAccessedAt: '2026-09-22T10:00:00Z',
    notes: 'Construyó reglas SPL para detección de logins fallidos.'
  },
  {
    id: 'enr-402',
    courseId: 'course-4',
    courseTitle: 'Ingesta y Correlación de Reglas en Splunk & Wazuh',
    courseCode: 'SIEM-402',
    studentId: 'usr-student-14',
    studentName: 'Martina Salazar',
    studentEmail: 'alumna.martina@edusec.local',
    enrolledAt: '2026-02-21T12:30:00Z',
    status: 'active',
    progressPercentage: 25,
    completedLessonIds: ['les-402-1'],
    lastAccessedAt: '2026-09-21T19:30:00Z',
    notes: 'Configuró con éxito agentes Wazuh y forwarders.'
  },
  {
    id: 'enr-403',
    courseId: 'course-4',
    courseTitle: 'Ingesta y Correlación de Reglas en Splunk & Wazuh',
    courseCode: 'SIEM-402',
    studentId: 'usr-student-15',
    studentName: 'Tomás Fuentes',
    studentEmail: 'alumno.tomas@edusec.local',
    enrolledAt: '2026-02-22T14:10:00Z',
    status: 'active',
    progressPercentage: 75,
    completedLessonIds: ['les-402-1', 'les-402-2', 'les-402-3'],
    lastAccessedAt: '2026-09-22T11:45:00Z',
    notes: 'Enriquecimiento contextual de alertas con MITRE ATT&CK.'
  },
  {
    id: 'enr-404',
    courseId: 'course-4',
    courseTitle: 'Ingesta y Correlación de Reglas en Splunk & Wazuh',
    courseCode: 'SIEM-402',
    studentId: 'usr-student-16',
    studentName: 'Constanza Peña',
    studentEmail: 'alumna.constanza@edusec.local',
    enrolledAt: '2026-02-23T15:40:00Z',
    status: 'active',
    progressPercentage: 0,
    completedLessonIds: [],
    lastAccessedAt: '2026-09-22T14:30:00Z',
    notes: 'Inscripción confirmada. Preparada para laboratorio de telemetría.'
  }
];

const INITIAL_EVENTS: SecurityEvent[] = [
  {
    id: 'SEC-EVT-001',
    timestamp: '2026-09-22T07:15:20Z',
    eventType: 'LOGIN_SUCCESS',
    severity: 'INFO',
    sourceIp: '192.168.1.55',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    endpoint: '/api/auth/login',
    httpMethod: 'POST',
    httpStatus: 200,
    actor: { id: 'usr-prof-1', email: 'prof.garcia@edusec.local', role: 'professor' },
    target: { type: 'AUTH_SESSION', name: 'Campus-Instructor-Session' },
    action: 'Inicio de sesión exitoso del profesor Dr. Carlos García',
    outcome: 'SUCCESS',
    details: { email: 'prof.garcia@edusec.local', role: 'professor', department: 'Ciberseguridad Defensiva' },
    mitreAttack: { techniqueId: 'T1078.003', techniqueName: 'Valid Accounts: Local Accounts', tactic: 'Initial Access' }
  },
  {
    id: 'SEC-EVT-002',
    timestamp: '2026-09-22T07:30:10Z',
    eventType: 'COURSE_ENROLLED',
    severity: 'LOW',
    sourceIp: '192.168.1.88',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    endpoint: '/api/courses/course-1/enroll',
    httpMethod: 'POST',
    httpStatus: 201,
    actor: { id: 'usr-student-1', email: 'alumno.martin@edusec.local', role: 'student' },
    target: { type: 'COURSE', id: 'course-1', name: 'SOC-101: Operación y Detección en SOC' },
    action: 'Inscripción formal de alumno en curso [SOC-101]',
    outcome: 'SUCCESS',
    details: { courseId: 'course-1', courseCode: 'SOC-101', studentEmail: 'alumno.martin@edusec.local' },
    mitreAttack: { techniqueId: 'T1078', techniqueName: 'Valid Accounts', tactic: 'Initial Access' }
  },
  {
    id: 'SEC-EVT-003',
    timestamp: '2026-09-22T07:45:00Z',
    eventType: 'LOGIN_FAILED',
    severity: 'LOW',
    sourceIp: '190.161.42.12',
    userAgent: 'python-requests/2.31.0',
    endpoint: '/api/auth/login',
    httpMethod: 'POST',
    httpStatus: 401,
    actor: { email: 'admin@edusec.local' },
    target: { type: 'AUTH_SERVICE', name: 'Campus Administration Portal' },
    action: 'Intento de inicio de sesión fallido para [admin@edusec.local]',
    outcome: 'FAILURE',
    details: { attemptedEmail: 'admin@edusec.local', consecutiveFailures: 1, origin: 'External Network' },
    mitreAttack: { techniqueId: 'T1110.001', techniqueName: 'Brute Force: Password Guessing', tactic: 'Credential Access' }
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.courses && parsed.enrollments && parsed.users) {
          return parsed;
        }
      } else if (fs.existsSync(BUNDLED_DB_FILE)) {
        const raw = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.courses && parsed.enrollments && parsed.users) {
          this.saveData(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading database from disk, bootstrapping defaults:', err);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      courses: INITIAL_COURSES,
      enrollments: INITIAL_ENROLLMENTS,
      events: INITIAL_EVENTS,
      webhookConfig: {
        url: '',
        enabled: false,
        format: 'json',
        minSeverity: 'LOW'
      }
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to disk:', err);
    }
  }

  private saveToDisk(): void {
    this.saveData(this.data);
  }

  // ----------------------------------------------------
  // Courses
  // ----------------------------------------------------
  getCourses(): Course[] {
    return this.data.courses;
  }

  getCourseById(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id);
  }

  createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>): Course {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.courses.unshift(newCourse);
    this.saveToDisk();
    return newCourse;
  }

  updateCourse(id: string, updates: Partial<Course>): Course | null {
    const course = this.data.courses.find(c => c.id === id);
    if (!course) return null;

    Object.assign(course, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    this.saveToDisk();
    return course;
  }

  deleteCourse(id: string): boolean {
    const idx = this.data.courses.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.courses.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // ----------------------------------------------------
  // Enrollments & Progress
  // ----------------------------------------------------
  getEnrollments(studentId?: string, courseId?: string): Enrollment[] {
    return this.data.enrollments.filter(e => {
      if (studentId && e.studentId !== studentId) return false;
      if (courseId && e.courseId !== courseId) return false;
      return true;
    });
  }

  getEnrollmentById(id: string): Enrollment | undefined {
    return this.data.enrollments.find(e => e.id === id);
  }

  createEnrollment(student: User, course: Course): Enrollment {
    // Check if already enrolled
    const existing = this.data.enrollments.find(
      e => e.studentId === student.id && e.courseId === course.id && e.status !== 'cancelled'
    );
    if (existing) {
      return existing;
    }

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progressPercentage: 0,
      completedLessonIds: [],
      lastAccessedAt: new Date().toISOString(),
      notes: 'Inscripción activa'
    };

    this.data.enrollments.unshift(newEnrollment);

    // Increment enrolledCount
    course.enrolledCount = (course.enrolledCount || 0) + 1;

    this.saveToDisk();
    return newEnrollment;
  }

  updateEnrollmentProgress(enrollmentId: string, completedLessonIds: string[]): Enrollment | null {
    const enr = this.data.enrollments.find(e => e.id === enrollmentId);
    if (!enr) return null;

    const course = this.getCourseById(enr.courseId);
    const totalLessons = course?.lessons.length || 4;

    enr.completedLessonIds = completedLessonIds;
    enr.progressPercentage = Math.min(100, Math.round((completedLessonIds.length / totalLessons) * 100));
    enr.lastAccessedAt = new Date().toISOString();
    if (enr.progressPercentage === 100) {
      enr.status = 'completed';
    }

    this.saveToDisk();
    return enr;
  }

  cancelEnrollment(enrollmentId: string): Enrollment | null {
    const enr = this.data.enrollments.find(e => e.id === enrollmentId);
    if (!enr) return null;

    enr.status = 'cancelled';
    enr.lastAccessedAt = new Date().toISOString();

    const course = this.getCourseById(enr.courseId);
    if (course && course.enrolledCount > 0) {
      course.enrolledCount -= 1;
    }

    this.saveToDisk();
    return enr;
  }

  // ----------------------------------------------------
  // Users & Authentication
  // ----------------------------------------------------
  getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  getUserById(id: string): User | undefined {
    const found = this.data.users.find(u => u.id === id);
    if (!found) return undefined;
    const { passwordHash, ...safeUser } = found;
    return safeUser;
  }

  getUserByEmail(emailOrUser: string): StoredUser | undefined {
    if (!emailOrUser) return undefined;
    const query = emailOrUser.trim().toLowerCase();
    return this.data.users.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uName = (u.name || '').toLowerCase();
      return (
        uEmail === query ||
        uName === query ||
        (u.role === 'admin' && (query === 'edusec' || query === 'admin@edusec.local' || query === 'admin'))
      );
    });
  }

  createUser(userData: { name: string; email: string; password: string; role: UserRole; department?: string }): User {
    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active',
      passwordHash: userData.password,
      department: userData.department || 'Campus General',
      createdAt: new Date().toISOString(),
      failedLoginCount: 0
    };
    this.data.users.push(newUser);
    this.saveToDisk();
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  updateUserPassword(userId: string, newPasswordPlain: string): boolean {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordPlain;
    this.saveToDisk();
    return true;
  }

  updateUserRole(userId: string, newRole: UserRole): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    user.role = newRole;
    this.saveToDisk();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  updateUserStatus(userId: string, newStatus: UserStatus): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    user.status = newStatus;
    this.saveToDisk();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  recordFailedLogin(email: string): number {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= 5) {
        user.status = 'locked';
      }
      this.saveToDisk();
      return user.failedLoginCount;
    }
    return 1;
  }

  resetFailedLogin(email: string): void {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.failedLoginCount = 0;
      user.lastLogin = new Date().toISOString();
      this.saveToDisk();
    }
  }

  // ----------------------------------------------------
  // SOC Security Telemetry & Audit
  // ----------------------------------------------------
  logEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp' | 'forwardedToWebhook'>): SecurityEvent {
    const newEvent: SecurityEvent = {
      ...eventData,
      id: `SEC-EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      forwardedToWebhook: false
    };

    // Forward to webhook asynchronously if enabled and meets min severity
    if (this.data.webhookConfig.enabled && this.data.webhookConfig.url) {
      const severityRanks: Record<EventSeverity, number> = {
        INFO: 1,
        LOW: 2,
        MEDIUM: 3,
        HIGH: 4,
        CRITICAL: 5
      };
      const eventRank = severityRanks[newEvent.severity] || 1;
      const minRank = severityRanks[this.data.webhookConfig.minSeverity] || 2;

      if (eventRank >= minRank) {
        this.forwardToWebhook(newEvent);
        newEvent.forwardedToWebhook = true;
      }
    }

    this.data.events.unshift(newEvent);
    if (this.data.events.length > 500) {
      this.data.events = this.data.events.slice(0, 500);
    }

    this.saveToDisk();
    return newEvent;
  }

  getEvents(filters?: {
    severity?: EventSeverity;
    eventType?: EventType;
    search?: string;
    limit?: number;
  }): SecurityEvent[] {
    let list = [...this.data.events];

    if (filters?.severity) {
      list = list.filter(e => e.severity === filters.severity);
    }

    if (filters?.eventType) {
      list = list.filter(e => e.eventType === filters.eventType);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        e =>
          e.action.toLowerCase().includes(q) ||
          e.sourceIp.includes(q) ||
          (e.actor.email && e.actor.email.toLowerCase().includes(q)) ||
          e.eventType.toLowerCase().includes(q) ||
          (e.mitreAttack && e.mitreAttack.techniqueId.toLowerCase().includes(q))
      );
    }

    if (filters?.limit) {
      list = list.slice(0, filters.limit);
    }

    return list;
  }

  clearEvents(): void {
    this.data.events = [];
    this.saveToDisk();
  }

  getStats(): SOCStats {
    const totalEvents = this.data.events.length;
    const failedLogins = this.data.events.filter(
      e => e.eventType === 'LOGIN_FAILED' || e.eventType === 'BRUTE_FORCE_DETECTED'
    ).length;
    const criticalAlerts = this.data.events.filter(
      e => e.severity === 'CRITICAL' || e.severity === 'HIGH'
    ).length;
    const adminActions = this.data.events.filter(
      e => e.eventType === 'ADMIN_ACTION' || e.eventType === 'PRIVILEGE_ESCALATION_ATTEMPT'
    ).length;
    const courseModifications = this.data.events.filter(
      e => e.eventType === 'COURSE_MODIFIED' || e.eventType === 'COURSE_DELETED'
    ).length;
    const enrollmentsCount = this.data.enrollments.length;

    const severityBreakdown: Record<EventSeverity, number> = {
      INFO: 0,
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };

    for (const evt of this.data.events) {
      severityBreakdown[evt.severity] = (severityBreakdown[evt.severity] || 0) + 1;
    }

    return {
      totalEvents,
      failedLogins,
      criticalAlerts,
      adminActions,
      courseModifications,
      enrollmentsCount,
      recentEventsCount: this.data.events.filter(
        e => Date.now() - new Date(e.timestamp).getTime() < 1000 * 60 * 15
      ).length,
      severityBreakdown,
      activeUsers: this.data.users.filter(u => u.status === 'active').length,
      totalCourses: this.data.courses.length,
      webhookConfigured: this.data.webhookConfig.enabled && !!this.data.webhookConfig.url
    };
  }

  // ----------------------------------------------------
  // Webhook
  // ----------------------------------------------------
  getWebhookConfig(): SOCWebhookConfig {
    return this.data.webhookConfig;
  }

  updateWebhookConfig(config: Partial<SOCWebhookConfig>): SOCWebhookConfig {
    this.data.webhookConfig = {
      ...this.data.webhookConfig,
      ...config
    };
    this.saveToDisk();
    return this.data.webhookConfig;
  }

  private async forwardToWebhook(event: SecurityEvent): Promise<void> {
    const { url, format, customAuthHeader } = this.data.webhookConfig;
    if (!url) return;

    try {
      let body: string;
      let contentType = 'application/json';

      if (format === 'cef') {
        body = this.formatAsCEF(event);
        contentType = 'text/plain';
      } else if (format === 'syslog') {
        body = this.formatAsSyslog(event);
        contentType = 'text/plain';
      } else {
        body = JSON.stringify({
          source: 'EduSec-LMS-SOC',
          timestamp: event.timestamp,
          alert: event
        });
      }

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'User-Agent': 'EduSec-SOC-Forwarder/1.0'
      };

      if (customAuthHeader) {
        headers['Authorization'] = customAuthHeader;
      }

      fetch(url, {
        method: 'POST',
        headers,
        body
      })
        .then(res => {
          this.data.webhookConfig.lastTestStatus = res.ok ? 'SUCCESS' : 'FAILURE';
          this.data.webhookConfig.lastTestTimestamp = new Date().toISOString();
        })
        .catch(() => {
          this.data.webhookConfig.lastTestStatus = 'FAILURE';
          this.data.webhookConfig.lastTestTimestamp = new Date().toISOString();
        });
    } catch {
      // Background network error ignored
    }
  }

  // ----------------------------------------------------
  // SIEM & SOC Formatters
  // ----------------------------------------------------
  formatAsCEF(event: SecurityEvent): string {
    const severityMap: Record<EventSeverity, number> = {
      INFO: 1,
      LOW: 3,
      MEDIUM: 5,
      HIGH: 8,
      CRITICAL: 10
    };
    const cefSev = severityMap[event.severity] || 3;
    const detailsClean = JSON.stringify(event.details).replace(/\|/g, '\\|');
    return `CEF:0|EduSec|CoursePlatform|1.0|${event.eventType}|${event.action}|${cefSev}|src=${event.sourceIp} suser=${event.actor.email || 'anonymous'} cs1Label=Endpoint cs1=${event.endpoint} cs2Label=Outcome cs2=${event.outcome} cs3Label=MITRE cs3=${event.mitreAttack?.techniqueId || 'None'} msg=${detailsClean}`;
  }

  formatAsSyslog(event: SecurityEvent): string {
    const priMap: Record<EventSeverity, number> = {
      INFO: 134,
      LOW: 133,
      MEDIUM: 132,
      HIGH: 131,
      CRITICAL: 129
    };
    const pri = priMap[event.severity] || 134;
    return `<${pri}>1 ${event.timestamp} edusec.campus edusec - ${event.id} [edusec@32473 ip="${event.sourceIp}" user="${event.actor.email || ''}" sev="${event.severity}" type="${event.eventType}" mitre="${event.mitreAttack?.techniqueId || ''}"] ${event.action} - Details: ${JSON.stringify(event.details)}`;
  }
}

export const db = new DatabaseManager();
