import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () =>
      import('./splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.page').then((m) => m.AdminPage),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'teacher',
    loadComponent: () =>
      import('./pages/teacher/teacher.page').then((m) => m.TeacherPage),
    canActivate: [AuthGuard],
    data: { roles: ['teacher'] },
    children: [
      {
        path: 'teacher-announcements',
        loadComponent: () =>
          import(
            './pages/teacher-announcements/teacher-announcements.page'
          ).then((m) => m.TeacherAnnouncementsPage),
      },
    ],
  },
  {
    path: 'student',
    loadComponent: () =>
      import('./pages/student/student.page').then((m) => m.StudentPage),
    canActivate: [AuthGuard],
    data: { roles: ['student'] },
  },

  {
    path: 'question-creator/:id',
    loadComponent: () =>
      import('./pages/question-creator/question-creator.page').then(
        (m) => m.QuestionCreatorPage
      ),
  },
  {
    path: 'task-results',
    loadComponent: () =>
      import('./task-results/task-results.page').then((m) => m.TaskResultsPage),
  },
  {
    path: 'teacher-students',
    loadComponent: () =>
      import('./pages/teacher-students/teacher-students.page').then(
        (m) => m.TeacherStudentsPage
      ),
  },
  {
    path: 'answer-task',
    loadComponent: () =>
      import('./pages/answer-task/answer-task.page').then(
        (m) => m.AnswerTaskPage
      ),
  },
  {
    path: 'stud-analysis',
    loadComponent: () =>
      import('./pages/stud-analysis/stud-analysis.page').then(
        (m) => m.StudentAnalysisPage
      ),
  },
  /* {
    path: 'student',
    loadComponent: () =>
      import('./pages/student/student.page').then((m) => m.StudentPage),
  }, */
  {
    path: 'answer-task/:id',
    loadComponent: () =>
      import('./pages/answer-task/answer-task.page').then(
        (m) => m.AnswerTaskPage
      ),
  },
  {
    path: 'student-analysis/:id',
    loadComponent: () =>
      import('./pages/stud-analysis/stud-analysis.page').then(
        (m) => m.StudentAnalysisPage
      ),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./pages/change-password/change-password.page').then(
        (m) => m.ChangePasswordPage
      ),
  },
  {
    path: 'student-announcements',
    loadComponent: () =>
      import('./pages/student-announcements/student-announcements.page').then(
        (m) => m.StudentAnnouncementsPage
      ),
  },
  {
    path: 'setup-admin',
    loadComponent: () => import('./pages/setup-admin/setup-admin.page').then( m => m.SetupAdminPage)
  },

];
