import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.page').then((m) => m.AdminPage),
  },
  /* {
    path: 'teacher',
    loadComponent: () =>
      import('./pages/teacher/teacher.page').then((m) => m.TeacherPage),
  }, */
  {
    path: 'student',
    loadComponent: () =>
      import('./pages/student/student.page').then((m) => m.StudentPage),
  },
  /* {
    path: 'question-creator',
    loadComponent: () =>
      import('./pages/question-creator/question-creator.page').then(
        (m) => m.QuestionCreatorPage
      ),
  }, */
  {
    path: 'teacher',
    loadComponent: () =>
      import('./pages/teacher/teacher.page').then((m) => m.TeacherPage),
  },
  {
    path: 'question-creator/:id',
    loadComponent: () =>
      import('./pages/question-creator/question-creator.page').then(
        (m) => m.QuestionCreatorPage
      ),
  },
];
