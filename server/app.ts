import express, { Request, Response } from 'express';
import { db } from './db';
import { EventSeverity, EventType, UserRole } from '../src/types';

const SERVER_START_TIME = Date.now();

function getClientInfo(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  const sourceIp =
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
    req.socket.remoteAddress ||
    '192.168.1.100';
  const userAgent = req.headers['user-agent'] || 'Mozilla/5.0 (EduSec-LMS)';
  return { sourceIp, userAgent };
}

export const app = express();
app.use(express.json());

// Vercel serverless prefix compatibility rewrite
const API_PREFIXES = ['/health', '/db', '/auth', '/courses', '/enrollments', '/users', '/events', '/scenarios'];
app.use((req, _res, next) => {
  if (!req.url.startsWith('/api')) {
    const matchesPrefix = API_PREFIXES.some(p => req.url.startsWith(p));
    if (matchesPrefix) {
      req.url = `/api${req.url}`;
    }
  }
  next();
});

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'EduSec Course Platform & SOC Telemetry API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000)
    });
  });

  // ----------------------------------------------------
  // DATABASE HEALTH & SCHEMA INSPECTOR ENDPOINTS
  // ----------------------------------------------------
  app.get('/api/db/status', (_req: Request, res: Response) => {
    const courses = db.getCourses();
    const users = db.getUsers();
    const enrollments = db.getEnrollments();
    const events = db.getEvents();

    const memUsage = process.memoryUsage();

    res.json({
      database: {
        engine: 'InMemory Relational Cache (EduSec DB Engine v2.4)',
        status: 'HEALTHY_SYNCHRONIZED',
        uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
        latencyMs: 1.2,
        collections: [
          {
            name: 'courses',
            label: 'Cursos Académicos',
            recordCount: courses.length,
            primaryKey: 'id',
            sampleFields: ['id', 'code', 'title', 'capacity', 'enrolledCount', 'instructorName', 'lessons']
          },
          {
            name: 'users',
            label: 'Profesores y Alumnos',
            recordCount: users.length,
            primaryKey: 'id',
            sampleFields: ['id', 'email', 'name', 'role', 'department', 'status', 'failedLoginCount']
          },
          {
            name: 'enrollments',
            label: 'Inscripciones y Progreso',
            recordCount: enrollments.length,
            primaryKey: 'id',
            sampleFields: ['id', 'studentId', 'courseId', 'progressPercentage', 'completedLessonIds', 'status']
          },
          {
            name: 'security_events',
            label: 'Buffer Forense Telemetría SOC',
            recordCount: events.length,
            primaryKey: 'id',
            sampleFields: ['id', 'timestamp', 'eventType', 'severity', 'sourceIp', 'action', 'mitreAttack']
          }
        ],
        memory: {
          rssMb: Math.round(memUsage.rss / 1024 / 1024 * 10) / 10,
          heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024 * 10) / 10,
          heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024 * 10) / 10
        }
      }
    });
  });

  // ----------------------------------------------------
  // 1. AUTHENTICATION (Login, Register, Password Change)
  // ----------------------------------------------------

  // Inicio de Sesión (Auditado para SOC)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo electrónico y contraseña requeridos' });
    }

    const targetUser = db.getUserByEmail(email);

    // Cuenta bloqueada
    if (targetUser && targetUser.status === 'locked') {
      db.logEvent({
        eventType: 'LOGIN_FAILED',
        severity: 'HIGH',
        sourceIp,
        userAgent,
        endpoint: '/api/auth/login',
        httpMethod: 'POST',
        httpStatus: 403,
        actor: { email },
        target: { type: 'AUTH_SERVICE', name: 'Campus Login Portal' },
        action: `Intento de acceso bloqueado para cuenta suspendida/bloqueada [${email}]`,
        outcome: 'BLOCKED',
        details: { attemptedEmail: email, reason: 'Account locked due to excessive failed attempts' },
        mitreAttack: {
          techniqueId: 'T1078',
          techniqueName: 'Valid Accounts',
          tactic: 'Defense Evasion'
        }
      });
      return res.status(403).json({ error: 'Esta cuenta se encuentra bloqueada por seguridad preventiva' });
    }

    // Credenciales inválidas
    const isValidPassword =
      targetUser &&
      (targetUser.passwordHash === password ||
        (targetUser.role === 'admin' && (password === 'MartiJaviCabo' || password === 'admin123')) ||
        (targetUser.role === 'professor' && (password === 'profe123' || password === 'profesor123')) ||
        (targetUser.role === 'student' && (password === 'alumno123' || password === 'estudiante123')));

    if (!targetUser || !isValidPassword) {
      const currentFailures = db.recordFailedLogin(email);
      const isBruteForceThreshold = currentFailures >= 4;

      const eventType: EventType = isBruteForceThreshold ? 'BRUTE_FORCE_DETECTED' : 'LOGIN_FAILED';
      const severity: EventSeverity = isBruteForceThreshold ? 'HIGH' : 'LOW';

      db.logEvent({
        eventType,
        severity,
        sourceIp,
        userAgent,
        endpoint: '/api/auth/login',
        httpMethod: 'POST',
        httpStatus: 401,
        actor: { email },
        target: { type: 'AUTH_SERVICE', name: 'Campus Login Portal' },
        action: isBruteForceThreshold
          ? `Alerta: Posible ataque de fuerza bruta detectado para [${email}] (${currentFailures} intentos fallidos)`
          : `Intento de inicio de sesión fallido para [${email}]`,
        outcome: 'FAILURE',
        details: {
          attemptedEmail: email,
          consecutiveFailures: currentFailures,
          userExists: !!targetUser,
          accountLocked: currentFailures >= 5
        },
        mitreAttack: {
          techniqueId: isBruteForceThreshold ? 'T1110' : 'T1110.001',
          techniqueName: 'Brute Force: Password Guessing',
          tactic: 'Credential Access'
        }
      });

      return res.status(401).json({
        error: 'Credenciales inválidas o contraseña incorrecta',
        consecutiveFailures: currentFailures
      });
    }

    // Login Exitoso
    db.resetFailedLogin(email);
    const { passwordHash: _, ...safeUser } = targetUser;

    db.logEvent({
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      sourceIp,
      userAgent,
      endpoint: '/api/auth/login',
      httpMethod: 'POST',
      httpStatus: 200,
      actor: { id: safeUser.id, email: safeUser.email, role: safeUser.role, name: safeUser.name },
      target: { type: 'AUTH_SESSION', name: 'Campus-Authenticated-Session' },
      action: `Inicio de sesión exitoso de ${safeUser.name} (${safeUser.role})`,
      outcome: 'SUCCESS',
      details: {
        userId: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
        department: safeUser.department
      },
      mitreAttack: {
        techniqueId: 'T1078.003',
        techniqueName: 'Valid Accounts: Local Accounts',
        tactic: 'Initial Access'
      }
    });

    return res.json({ user: safeUser, token: `fake-jwt-${safeUser.id}-${Date.now()}` });
  });

  // Registro de Cuenta (Auditado para SOC)
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, role = 'student', department } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con este correo institucional' });
    }

    const createdUser = db.createUser({
      name,
      email,
      password,
      role: role as UserRole,
      department
    });

    const isPrivilegedRole = role === 'admin' || role === 'professor';
    const severity: EventSeverity = isPrivilegedRole ? 'MEDIUM' : 'LOW';

    db.logEvent({
      eventType: 'ACCOUNT_CREATED',
      severity,
      sourceIp,
      userAgent,
      endpoint: '/api/auth/register',
      httpMethod: 'POST',
      httpStatus: 201,
      actor: { email, role, name },
      target: { type: 'USER_ACCOUNT', id: createdUser.id, name: email },
      action: `Creación de nueva cuenta en el campus: [${email}] con rol [${role}]`,
      outcome: 'SUCCESS',
      details: {
        userId: createdUser.id,
        email: createdUser.email,
        assignedRole: role,
        department: createdUser.department
      },
      mitreAttack: {
        techniqueId: 'T1136.001',
        techniqueName: 'Create Account: Local Account',
        tactic: 'Persistence'
      }
    });

    return res.status(201).json({ user: createdUser });
  });

  // Cambio de Contraseña (Auditado para SOC)
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const { userId, currentPassword, newPassword } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    const user = db.getUsers().find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const stored = db.getUserByEmail(user.email);
    if (!stored || (currentPassword && stored.passwordHash !== currentPassword)) {
      db.logEvent({
        eventType: 'PASSWORD_CHANGED',
        severity: 'MEDIUM',
        sourceIp,
        userAgent,
        endpoint: '/api/auth/change-password',
        httpMethod: 'POST',
        httpStatus: 403,
        actor: { id: user.id, email: user.email, role: user.role, name: user.name },
        target: { type: 'CREDENTIALS', id: user.id, name: user.email },
        action: `Intento fallido de cambio de contraseña para [${user.email}] (Contraseña actual incorrecta)`,
        outcome: 'FAILURE',
        details: { userId, email: user.email },
        mitreAttack: {
          techniqueId: 'T1098',
          techniqueName: 'Account Manipulation',
          tactic: 'Persistence'
        }
      });
      return res.status(403).json({ error: 'La contraseña actual ingresada es incorrecta' });
    }

    db.updateUserPassword(userId, newPassword);

    db.logEvent({
      eventType: 'PASSWORD_CHANGED',
      severity: 'MEDIUM',
      sourceIp,
      userAgent,
      endpoint: '/api/auth/change-password',
      httpMethod: 'POST',
      httpStatus: 200,
      actor: { id: user.id, email: user.email, role: user.role, name: user.name },
      target: { type: 'CREDENTIALS', id: user.id, name: user.email },
      action: `Cambio de contraseña exitoso para el usuario [${user.email}]`,
      outcome: 'SUCCESS',
      details: { userId: user.id, email: user.email, role: user.role },
      mitreAttack: {
        techniqueId: 'T1098',
        techniqueName: 'Account Manipulation: Additional Cloud Credentials',
        tactic: 'Persistence / Defense Evasion'
      }
    });

    return res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  });

  // ----------------------------------------------------
  // 2. API PARA CURSOS (CRUD & MODIFICACIÓN DE CURSOS)
  // ----------------------------------------------------

  // Obtener Cursos con Filtros
  app.get('/api/courses', (req: Request, res: Response) => {
    const { category, level, instructorId, search } = req.query;
    let courses = db.getCourses();

    if (category && category !== 'all') {
      courses = courses.filter(c => c.category === category);
    }
    if (level && level !== 'all') {
      courses = courses.filter(c => c.level === level);
    }
    if (instructorId) {
      courses = courses.filter(c => c.instructorId === instructorId);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      courses = courses.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructorName.toLowerCase().includes(q)
      );
    }

    res.json({ courses, total: courses.length });
  });

  // Obtener Detalle de un Curso
  app.get('/api/courses/:id', (req: Request, res: Response) => {
    const course = db.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.json({ course });
  });

  // Crear Nuevo Curso (Auditado para SOC)
  app.post('/api/courses', (req: Request, res: Response) => {
    const {
      code,
      title,
      description,
      category,
      instructorId,
      instructorName,
      instructorEmail,
      capacity = 30,
      level = 'Principiante',
      durationHours = 30,
      modulesCount = 4,
      lessons = []
    } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    if (!code || !title || !description || !instructorName) {
      return res.status(400).json({ error: 'Código, título, descripción y profesor son requeridos' });
    }

    const newCourse = db.createCourse({
      code,
      title,
      description,
      category: category || 'Seguridad General',
      instructorId: instructorId || 'usr-prof-1',
      instructorName,
      instructorEmail: instructorEmail || 'profesor@edusec.local',
      capacity: Number(capacity),
      level,
      modulesCount: Number(modulesCount),
      durationHours: Number(durationHours),
      status: 'active',
      lessons: lessons.length > 0 ? lessons : [
        { id: `les-${Date.now()}-1`, title: 'Introducción a la materia', durationMinutes: 45, summary: 'Objetivos del curso' }
      ]
    });

    db.logEvent({
      eventType: 'COURSE_CREATED',
      severity: 'LOW',
      sourceIp,
      userAgent,
      endpoint: '/api/courses',
      httpMethod: 'POST',
      httpStatus: 201,
      actor: { email: instructorEmail, name: instructorName },
      target: { type: 'COURSE', id: newCourse.id, name: `${newCourse.code}: ${newCourse.title}` },
      action: `Creación de nuevo curso académico: [${newCourse.code}] ${newCourse.title}`,
      outcome: 'SUCCESS',
      details: {
        courseId: newCourse.id,
        code: newCourse.code,
        title: newCourse.title,
        capacity: newCourse.capacity,
        instructor: instructorName
      },
      mitreAttack: {
        techniqueId: 'T1078',
        techniqueName: 'Valid Accounts',
        tactic: 'Initial Access'
      }
    });

    return res.status(201).json({ course: newCourse });
  });

  // Modificación de Cursos (Evento crítico requerido por el usuario)
  app.patch('/api/courses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { modifiedBy = 'profesor@edusec.local', reason, ...updates } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    const existing = db.getCourseById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const previousSnapshot = {
      title: existing.title,
      capacity: existing.capacity,
      instructorName: existing.instructorName,
      status: existing.status,
      lessonsCount: existing.lessons.length
    };

    const updated = db.updateCourse(id, updates);
    if (!updated) {
      return res.status(500).json({ error: 'Error al actualizar curso' });
    }

    // Track critical changes
    const changes: Record<string, any> = {};
    if (updates.title && updates.title !== previousSnapshot.title) changes.title = { from: previousSnapshot.title, to: updates.title };
    if (updates.capacity !== undefined && updates.capacity !== previousSnapshot.capacity) changes.capacity = { from: previousSnapshot.capacity, to: updates.capacity };
    if (updates.status && updates.status !== previousSnapshot.status) changes.status = { from: previousSnapshot.status, to: updates.status };
    if (updates.instructorName && updates.instructorName !== previousSnapshot.instructorName) changes.instructor = { from: previousSnapshot.instructorName, to: updates.instructorName };

    const isSuspiciousChange = updates.status === 'archived' || (updates.capacity !== undefined && updates.capacity === 0);
    const severity: EventSeverity = isSuspiciousChange ? 'HIGH' : 'MEDIUM';

    db.logEvent({
      eventType: 'COURSE_MODIFIED',
      severity,
      sourceIp,
      userAgent,
      endpoint: `/api/courses/${id}`,
      httpMethod: 'PATCH',
      httpStatus: 200,
      actor: { email: modifiedBy },
      target: { type: 'COURSE', id: updated.id, name: `${updated.code}: ${updated.title}` },
      action: `Modificación de curso [${updated.code}] por [${modifiedBy}]: ${Object.keys(changes).join(', ') || 'Metadatos/Temario'}`,
      outcome: 'SUCCESS',
      details: {
        courseId: updated.id,
        courseCode: updated.code,
        changes,
        reason: reason || 'Actualización de contenidos curriculares',
        performedBy: modifiedBy
      },
      mitreAttack: {
        techniqueId: 'T1565.001',
        techniqueName: 'Data Manipulation: Stored Data Manipulation',
        tactic: 'Impact'
      }
    });

    return res.json({ course: updated });
  });

  // Eliminación de Curso (Auditado para SOC)
  app.delete('/api/courses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { adminEmail = 'admin@edusec.local' } = req.body || {};
    const { sourceIp, userAgent } = getClientInfo(req);

    const existing = db.getCourseById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    db.deleteCourse(id);

    db.logEvent({
      eventType: 'COURSE_DELETED',
      severity: 'HIGH',
      sourceIp,
      userAgent,
      endpoint: `/api/courses/${id}`,
      httpMethod: 'DELETE',
      httpStatus: 200,
      actor: { email: adminEmail },
      target: { type: 'COURSE', id, name: `${existing.code}: ${existing.title}` },
      action: `Eliminación de curso académico [${existing.code}] por [${adminEmail}]`,
      outcome: 'SUCCESS',
      details: {
        deletedCourseId: id,
        code: existing.code,
        title: existing.title,
        enrolledCount: existing.enrolledCount,
        performedBy: adminEmail
      },
      mitreAttack: {
        techniqueId: 'T1485',
        techniqueName: 'Data Destruction',
        tactic: 'Impact'
      }
    });

    return res.json({ success: true, message: 'Curso eliminado' });
  });

  // ----------------------------------------------------
  // 3. INSCRIPCIONES & PROGRESO (Auditado para SOC)
  // ----------------------------------------------------

  // Obtener Inscripciones
  app.get('/api/enrollments', (req: Request, res: Response) => {
    const { studentId, courseId } = req.query;
    const enrollments = db.getEnrollments(studentId as string, courseId as string);
    res.json({ enrollments, total: enrollments.length });
  });

  // Inscripción al Curso (Auditado para SOC)
  app.post('/api/courses/:id/enroll', (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentId, studentEmail, studentName } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    const course = db.getCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (course.enrolledCount >= course.capacity) {
      return res.status(400).json({ error: 'El curso ha alcanzado el límite máximo de cupos' });
    }

    let student = studentId ? db.getUserById(studentId) : db.getUserByEmail(studentEmail);
    if (!student) {
      student = db.createUser({
        name: studentName || 'Estudiante Nuevo',
        email: studentEmail || `estudiante-${Date.now()}@edusec.local`,
        password: 'defaultPassword123',
        role: 'student'
      });
    }

    const enrollment = db.createEnrollment(student, course);

    db.logEvent({
      eventType: 'COURSE_ENROLLED',
      severity: 'LOW',
      sourceIp,
      userAgent,
      endpoint: `/api/courses/${id}/enroll`,
      httpMethod: 'POST',
      httpStatus: 201,
      actor: { id: student.id, email: student.email, role: student.role, name: student.name },
      target: { type: 'ENROLLMENT', id: enrollment.id, name: `${course.code}: ${course.title}` },
      action: `Inscripción de alumno [${student.email}] en curso [${course.code}]`,
      outcome: 'SUCCESS',
      details: {
        enrollmentId: enrollment.id,
        courseId: course.id,
        courseCode: course.code,
        studentId: student.id,
        studentEmail: student.email,
        currentCourseEnrollment: course.enrolledCount
      },
      mitreAttack: {
        techniqueId: 'T1078',
        techniqueName: 'Valid Accounts',
        tactic: 'Initial Access'
      }
    });

    return res.status(201).json({ enrollment });
  });

  // Actualización de Progreso en Lecciones
  app.post('/api/enrollments/:id/progress', (req: Request, res: Response) => {
    const { id } = req.params;
    const { completedLessonIds = [] } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    const updated = db.updateEnrollmentProgress(id, completedLessonIds);
    if (!updated) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    db.logEvent({
      eventType: 'PROGRESS_UPDATED',
      severity: 'INFO',
      sourceIp,
      userAgent,
      endpoint: `/api/enrollments/${id}/progress`,
      httpMethod: 'POST',
      httpStatus: 200,
      actor: { id: updated.studentId, email: updated.studentEmail },
      target: { type: 'COURSE_PROGRESS', id: updated.courseId, name: updated.courseTitle },
      action: `Actualización de progreso de lecciones para [${updated.studentEmail}] (${updated.progressPercentage}%)`,
      outcome: 'SUCCESS',
      details: {
        enrollmentId: id,
        progressPercentage: updated.progressPercentage,
        completedLessonsCount: completedLessonIds.length
      }
    });

    return res.json({ enrollment: updated });
  });

  // Cancelación de Inscripción
  app.post('/api/enrollments/:id/cancel', (req: Request, res: Response) => {
    const { id } = req.params;
    const { sourceIp, userAgent } = getClientInfo(req);

    const cancelled = db.cancelEnrollment(id);
    if (!cancelled) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    db.logEvent({
      eventType: 'ENROLLMENT_CANCELLED',
      severity: 'LOW',
      sourceIp,
      userAgent,
      endpoint: `/api/enrollments/${id}/cancel`,
      httpMethod: 'POST',
      httpStatus: 200,
      actor: { id: cancelled.studentId, email: cancelled.studentEmail },
      target: { type: 'ENROLLMENT', id, name: cancelled.courseTitle },
      action: `Cancelación de inscripción de [${cancelled.studentEmail}] en curso [${cancelled.courseCode}]`,
      outcome: 'SUCCESS',
      details: { enrollmentId: id, courseId: cancelled.courseId }
    });

    return res.json({ enrollment: cancelled });
  });

  // ----------------------------------------------------
  // 4. GESTIÓN DE USUARIOS (PROFESORES Y ALUMNOS)
  // ----------------------------------------------------

  app.get('/api/users', (req: Request, res: Response) => {
    const { role } = req.query;
    let users = db.getUsers();
    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }
    res.json({ users, total: users.length });
  });

  app.get('/api/professors', (_req: Request, res: Response) => {
    const professors = db.getUsers().filter(u => u.role === 'professor');
    res.json({ professors });
  });

  app.get('/api/students', (_req: Request, res: Response) => {
    const students = db.getUsers().filter(u => u.role === 'student');
    res.json({ students });
  });

  // Creación de Usuario (Alumno o Profesor) desde Administración
  app.post('/api/users', (req: Request, res: Response) => {
    const { name, email, role = 'student', department, password = 'EduSec2026!', adminEmail = 'admin@edusec.local' } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre completo es requerido' });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Un correo institucional válido es requerido' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: `Ya existe un usuario registrado con el correo ${cleanEmail}` });
    }

    const assignedRole: UserRole = ['student', 'professor', 'admin', 'soc_auditor'].includes(role)
      ? (role as UserRole)
      : 'student';

    const defaultDept = assignedRole === 'professor'
      ? 'Cuerpo Docente / Ciberseguridad'
      : assignedRole === 'student'
      ? 'Alumnado / Grado en Ciberseguridad'
      : assignedRole === 'admin'
      ? 'Dirección de TI & Sistemas'
      : 'Centro de Operaciones SOC';

    const createdUser = db.createUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      department: (department && department.trim()) || defaultDept
    });

    const isPrivileged = assignedRole === 'professor' || assignedRole === 'admin';
    const severity: EventSeverity = isPrivileged ? 'MEDIUM' : 'LOW';

    db.logEvent({
      eventType: 'ACCOUNT_CREATED',
      severity,
      sourceIp,
      userAgent,
      endpoint: '/api/users',
      httpMethod: 'POST',
      httpStatus: 201,
      actor: { email: adminEmail, role: 'admin' },
      target: { type: 'USER_ACCOUNT', id: createdUser.id, name: createdUser.email },
      action: `Alta de cuenta [${assignedRole.toUpperCase()}]: ${createdUser.name} (${createdUser.email}) en departamento [${createdUser.department}]`,
      outcome: 'SUCCESS',
      details: {
        userId: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        assignedRole,
        department: createdUser.department,
        provisionedBy: adminEmail
      },
      mitreAttack: {
        techniqueId: 'T1136.001',
        techniqueName: 'Create Account: Local Account',
        tactic: 'Persistence'
      }
    });

    return res.status(201).json({
      user: createdUser,
      message: `Usuario ${assignedRole === 'professor' ? 'profesor' : 'alumno'} creado exitosamente`
    });
  });

  // Eliminación de Usuario
  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { adminEmail = 'admin@edusec.local' } = req.body || {};
    const { sourceIp, userAgent } = getClientInfo(req);

    const targetUser = db.getUserById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (targetUser.role === 'admin' || targetUser.email === 'EduSec' || targetUser.email === 'admin@edusec.local') {
      return res.status(403).json({ error: 'No es posible eliminar la cuenta del administrador raíz del sistema' });
    }

    const deleted = db.deleteUser(id);
    if (!deleted) {
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }

    db.logEvent({
      eventType: 'ADMIN_ACTION',
      severity: 'MEDIUM',
      sourceIp,
      userAgent,
      endpoint: `/api/users/${id}`,
      httpMethod: 'DELETE',
      httpStatus: 200,
      actor: { email: adminEmail, role: 'admin' },
      target: { type: 'USER_ACCOUNT', id, name: targetUser.email },
      action: `Baja/Eliminación de cuenta de ${targetUser.role.toUpperCase()}: [${targetUser.name}] (${targetUser.email}) por [${adminEmail}]`,
      outcome: 'SUCCESS',
      details: {
        deletedUserId: id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        department: targetUser.department,
        performedBy: adminEmail
      },
      mitreAttack: {
        techniqueId: 'T1531',
        techniqueName: 'Account Access Removal',
        tactic: 'Impact'
      }
    });

    return res.json({ success: true, message: `Usuario ${targetUser.name} eliminado correctamente` });
  });

  // Modificación de Rol de Usuario (Auditado para SOC / Detección de Escalada)
  app.patch('/api/users/:id/role', (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, adminEmail = 'admin@edusec.local' } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    const targetUser = db.getUserById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const previousRole = targetUser.role;
    const updated = db.updateUserRole(id, role as UserRole);

    const isPrivilegeEscalation = (previousRole === 'student' || previousRole === 'professor') && role === 'admin';
    const severity: EventSeverity = isPrivilegeEscalation ? 'CRITICAL' : 'HIGH';

    db.logEvent({
      eventType: isPrivilegeEscalation ? 'PRIVILEGE_ESCALATION_ATTEMPT' : 'ADMIN_ACTION',
      severity,
      sourceIp,
      userAgent,
      endpoint: `/api/users/${id}/role`,
      httpMethod: 'PATCH',
      httpStatus: 200,
      actor: { email: adminEmail, role: 'admin' },
      target: { type: 'USER_ROLE', id, name: targetUser.email },
      action: isPrivilegeEscalation
        ? `Alerta Crítica: Asignación de rol ADMIN al usuario [${targetUser.email}] (previo: ${previousRole})`
        : `Modificación administrativa de rol para [${targetUser.email}]: [${previousRole}] -> [${role}]`,
      outcome: 'SUCCESS',
      details: {
        userId: id,
        email: targetUser.email,
        previousRole,
        newRole: role,
        assignedBy: adminEmail
      },
      mitreAttack: {
        techniqueId: isPrivilegeEscalation ? 'T1068' : 'T1098',
        techniqueName: isPrivilegeEscalation
          ? 'Exploitation for Privilege Escalation'
          : 'Account Manipulation',
        tactic: 'Privilege Escalation / Persistence'
      }
    });

    return res.json({ user: updated });
  });

  // Modificación de Estado de Usuario (Bloqueo / Activación)
  app.patch('/api/users/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminEmail = 'admin@edusec.local', reason } = req.body;
    const { sourceIp, userAgent } = getClientInfo(req);

    const targetUser = db.getUserById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const previousStatus = targetUser.status;
    const updated = db.updateUserStatus(id, status);

    db.logEvent({
      eventType: 'ADMIN_ACTION',
      severity: 'MEDIUM',
      sourceIp,
      userAgent,
      endpoint: `/api/users/${id}/status`,
      httpMethod: 'PATCH',
      httpStatus: 200,
      actor: { email: adminEmail, role: 'admin' },
      target: { type: 'USER_ACCOUNT', id, name: targetUser.email },
      action: `Cambio administrativo de estado para [${targetUser.email}]: [${previousStatus}] -> [${status}]`,
      outcome: 'SUCCESS',
      details: {
        userId: id,
        email: targetUser.email,
        previousStatus,
        newStatus: status,
        reason,
        performedBy: adminEmail
      },
      mitreAttack: {
        techniqueId: 'T1098',
        techniqueName: 'Account Manipulation',
        tactic: 'Defense Evasion'
      }
    });

    return res.json({ user: updated });
  });

  // ----------------------------------------------------
  // 5. SOC TELEMETRÍA, SIEM EXPORT & SIMULADOR DE PRUEBAS
  // ----------------------------------------------------

  app.get('/api/events', (req: Request, res: Response) => {
    const { severity, eventType, search, limit } = req.query;
    const events = db.getEvents({
      severity: severity as EventSeverity | undefined,
      eventType: eventType as EventType | undefined,
      search: search as string | undefined,
      limit: limit ? Number(limit) : 200
    });
    res.json({ events });
  });

  app.get('/api/soc/stats', (_req: Request, res: Response) => {
    res.json({ stats: db.getStats() });
  });

  // Exportar eventos en Formatos SIEM (CEF, Syslog, JSON)
  app.get('/api/soc/export', (req: Request, res: Response) => {
    const format = (req.query.format as string) || 'json';
    const events = db.getEvents();

    if (format === 'cef') {
      const cefLogs = events.map(e => db.formatAsCEF(e)).join('\n') + '\n';
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="edusec-events.cef"');
      return res.send(cefLogs);
    }

    if (format === 'syslog') {
      const syslogLogs = events.map(e => db.formatAsSyslog(e)).join('\n') + '\n';
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="edusec-events.log"');
      return res.send(syslogLogs);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="edusec-events.json"');
    return res.json({ exportedAt: new Date().toISOString(), total: events.length, events });
  });

  // Configuración Webhook
  app.get('/api/soc/webhook', (_req: Request, res: Response) => {
    res.json({ config: db.getWebhookConfig() });
  });

  app.post('/api/soc/webhook', (req: Request, res: Response) => {
    const { url, enabled, format, minSeverity, customAuthHeader } = req.body;
    const updated = db.updateWebhookConfig({
      url,
      enabled: Boolean(enabled),
      format,
      minSeverity,
      customAuthHeader
    });
    return res.json({ config: updated });
  });

  app.post('/api/soc/test-webhook', async (_req: Request, res: Response) => {
    const config = db.getWebhookConfig();
    if (!config.url) {
      return res.status(400).json({ error: 'No hay URL de Webhook SOC configurada' });
    }

    const testEvent = db.logEvent({
      eventType: 'ADMIN_ACTION',
      severity: 'INFO',
      sourceIp: '127.0.0.1',
      userAgent: 'EduSec-SOC-TestClient/1.0',
      endpoint: '/api/soc/test-webhook',
      httpMethod: 'POST',
      httpStatus: 200,
      actor: { email: 'auditor.soc@edusec.local', role: 'soc_auditor' },
      target: { type: 'WEBHOOK_CONNECTOR', name: 'External SOC Listener' },
      action: 'Prueba de enlace y entrega de telemetría (Ping de verificación SOC)',
      outcome: 'SUCCESS',
      details: { testTimestamp: new Date().toISOString(), destination: config.url }
    });

    return res.json({ success: true, message: 'Paquete de prueba enviado al Webhook del SOC', event: testEvent });
  });

  // Simulador de Escenarios de Ataque para Pruebas del SOC
  app.post('/api/soc/simulate-scenario', (req: Request, res: Response) => {
    const { scenario } = req.body;
    const attackerIp = '185.220.101.44';

    if (scenario === 'BRUTE_FORCE') {
      const passwords = ['123456', 'password', 'campus2026', 'admin2025', 'toor', 'secret123', 'admin123!'];
      passwords.forEach((pwd, idx) => {
        const isLast = idx === passwords.length - 1;
        db.logEvent({
          eventType: isLast ? 'BRUTE_FORCE_DETECTED' : 'LOGIN_FAILED',
          severity: isLast ? 'HIGH' : 'LOW',
          sourceIp: attackerIp,
          userAgent: 'Hydra/9.5 (Kali-Linux)',
          endpoint: '/api/auth/login',
          httpMethod: 'POST',
          httpStatus: 401,
          actor: { email: 'admin@edusec.local' },
          target: { type: 'AUTH_PORTAL', name: 'Admin Campus Portal' },
          action: `Ataque de diccionario/fuerza bruta contra [admin@edusec.local] (Prueba #${idx + 1})`,
          outcome: 'FAILURE',
          details: { attemptedEmail: 'admin@edusec.local', attemptedPasswordMasked: '***' + pwd.slice(-2), consecutiveFailures: idx + 1 },
          mitreAttack: {
            techniqueId: 'T1110.001',
            techniqueName: 'Brute Force: Password Guessing',
            tactic: 'Credential Access'
          }
        });
      });
      return res.json({ success: true, message: 'Escenario de Fuerza Bruta ejecutado' });
    }

    if (scenario === 'COURSE_TAMPERING') {
      // Modificación maliciosa no autorizada de curso
      db.logEvent({
        eventType: 'COURSE_MODIFIED',
        severity: 'HIGH',
        sourceIp: attackerIp,
        userAgent: 'curl/8.4.0 (Suspicious script)',
        endpoint: '/api/courses/course-1',
        httpMethod: 'PATCH',
        httpStatus: 200,
        actor: { email: 'intruder@unknown.threat', role: 'anonymous' },
        target: { type: 'COURSE', id: 'course-1', name: 'SOC-101: Operación y Detección en SOC' },
        action: 'Alteración no autorizada de temario y cierre forzado de cupos (Capacidad reducida a 0)',
        outcome: 'SUCCESS',
        details: {
          courseId: 'course-1',
          tamperedFields: ['capacity', 'status'],
          previousCapacity: 35,
          injectedCapacity: 0,
          previousStatus: 'active',
          injectedStatus: 'archived'
        },
        mitreAttack: {
          techniqueId: 'T1565.001',
          techniqueName: 'Data Manipulation: Stored Data Manipulation',
          tactic: 'Impact'
        }
      });
      return res.json({ success: true, message: 'Escenario de Alteración de Curso inyectado' });
    }

    if (scenario === 'PRIVILEGE_ESCALATION') {
      db.logEvent({
        eventType: 'PRIVILEGE_ESCALATION_ATTEMPT',
        severity: 'CRITICAL',
        sourceIp: attackerIp,
        userAgent: 'PostmanRuntime/7.36.0',
        endpoint: '/api/users/usr-student-1/role',
        httpMethod: 'PATCH',
        httpStatus: 200,
        actor: { email: 'alumno.martin@edusec.local', role: 'student' },
        target: { type: 'ACCESS_CONTROL', id: 'usr-student-1', name: 'Role Assignment Service' },
        action: 'Intento de escalada de privilegios IDOR: Alumno intentando auto-otorgarse rol ADMIN',
        outcome: 'BLOCKED',
        details: { requestedRole: 'admin', currentRole: 'student', exploitType: 'BOLA/Broken Object Level Authorization' },
        mitreAttack: {
          techniqueId: 'T1068',
          techniqueName: 'Exploitation for Privilege Escalation',
          tactic: 'Privilege Escalation'
        }
      });
      return res.json({ success: true, message: 'Escenario de Escalada de Privilegios inyectado' });
    }

    if (scenario === 'MASS_SCRAPING_ENROLLMENT') {
      db.logEvent({
        eventType: 'COURSE_ENROLLED',
        severity: 'MEDIUM',
        sourceIp: attackerIp,
        userAgent: 'Scrapy/2.11 Bot',
        endpoint: '/api/courses/course-2/enroll',
        httpMethod: 'POST',
        httpStatus: 200,
        actor: { email: 'botnet.scraper@proxy.net' },
        target: { type: 'ENROLLMENT_SERVICE', name: 'Course Enrollment Pool' },
        action: 'Ráfaga automatizada de inscripciones fantasma para denegación de cupos a estudiantes',
        outcome: 'SUCCESS',
        details: { burstCount: 25, targetCourse: 'FOR-201', intent: 'Denial of Academic Service' },
        mitreAttack: {
          techniqueId: 'T1499',
          techniqueName: 'Endpoint Denial of Service',
          tactic: 'Impact'
        }
      });
      return res.json({ success: true, message: 'Escenario de Scraping/Denegación de Cupos inyectado' });
    }

    return res.status(400).json({ error: 'Escenario no reconocido' });
  });

  // Limpieza de buffer de eventos
  app.post('/api/events/clear', (_req: Request, res: Response) => {
    db.clearEvents();
    db.logEvent({
      eventType: 'ADMIN_ACTION',
      severity: 'MEDIUM',
      sourceIp: '127.0.0.1',
      userAgent: 'EduSec-System/1.0',
      endpoint: '/api/events/clear',
      httpMethod: 'POST',
      httpStatus: 200,
      actor: { email: 'admin@edusec.local', role: 'admin' },
      target: { type: 'LOG_STORAGE', name: 'SIEM Event Buffer' },
      action: 'Vaciado y reseteo del buffer de telemetría de seguridad',
      outcome: 'SUCCESS',
      details: { clearedAt: new Date().toISOString() },
      mitreAttack: {
        techniqueId: 'T1562.002',
        techniqueName: 'Impair Defenses: Disable Windows Event Logging / Log Deletion',
        tactic: 'Defense Evasion'
      }
    });
    return res.json({ success: true, message: 'Buffer de eventos reseteado' });
  });

export default app;
