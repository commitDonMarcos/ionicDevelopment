import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { TaskResultsPage } from '../../task-results/task-results.page';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { ToastController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { TeacherStudentsPage } from '../teacher-students/teacher-students.page';

interface Task {
  id: string;
  title: string;
  deadline?: string | null;
  numItems: number;
  createdAt: number;
  createdBy: number;
  questions?: any[];
  status?: 'open' | 'closed';
}

interface User {
  id: number;
  username: string;
  subject?: string;
  photo?: string;
  role?: string;
}

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.page.html',
  styleUrls: ['./teacher.page.scss'],
  standalone: true,
  imports: [
    IonicModule, //  Handles all Ionic elements
    CommonModule,
    FormsModule,
  ],
})
export class TeacherPage {
  teacher: User | null = null;
  taskForm = { title: '', deadline: '', numItems: 1 };
  tasks: Task[] = [];

  constructor(
    private storage: Storage,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({ 'trash-outline': trashOutline });
  }
  async openStudentManager() {
    const modal = await this.modalCtrl.create({
      component: TeacherStudentsPage,
    });
    await modal.present();
  }

  async ionViewWillEnter() {
    await this.loadTeacher();
    await this.loadTasks();
    await this.checkTaskDeadlines(); //  auto-close check added here
  }

  async loadTeacher() {
    await this.storage.create();
    this.teacher = (await this.storage.get('currentUser')) || null;
  }

  async loadTasks() {
    await this.storage.create();
    const allTasks: Task[] = (await this.storage.get('tasks')) || [];
    const teacherId = this.teacher?.id;
    this.tasks = (allTasks.filter((t) => t.createdBy === teacherId) || []).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  async createTask() {
    if (
      !this.taskForm.title.trim() ||
      !this.taskForm.numItems ||
      this.taskForm.numItems < 1
    ) {
      const t = await this.toastCtrl.create({
        message: 'Title and number of items are required (min 1).',
        duration: 2000,
        color: 'warning',
      });
      t.present();
      return;
    }

    const allTasks: Task[] = (await this.storage.get('tasks')) || [];
    const newTask: Task = {
      id: Date.now().toString(),
      title: this.taskForm.title.trim(),
      deadline: this.taskForm.deadline || null,
      numItems: Number(this.taskForm.numItems),
      createdAt: Date.now(),
      createdBy: this.teacher!.id,
      questions: [],
      status: 'open', // 👈 initialize as open
    };

    allTasks.push(newTask);
    await this.storage.set('tasks', allTasks);

    this.taskForm = { title: '', deadline: '', numItems: 1 };
    await this.loadTasks();

    const toast = await this.toastCtrl.create({
      message: 'Task saved. Click "Create Questions" to add questions.',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  triggerPhotoPicker() {
    const input: HTMLInputElement | null = document.getElementById(
      'photoInput'
    ) as HTMLInputElement;
    if (input) input.click();
  }

  async changePhoto(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const user = (await this.storage.get('currentUser')) || null;
      if (!user) return;
      user.photo = base64;
      await this.storage.set('currentUser', user);

      const users = (await this.storage.get('users')) || [];
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) {
        users[idx].photo = base64;
        await this.storage.set('users', users);
      }

      this.teacher = user;
      const toast = await this.toastCtrl.create({
        message: 'Profile photo updated',
        duration: 1500,
        color: 'success',
      });
      toast.present();
    };
    reader.readAsDataURL(file);
  }

  goToQuestionCreator(task: Task) {
    if (task.status === 'closed') {
      this.showToast('This task is closed. You can’t add questions.', 'medium');
      return;
    }
    this.router.navigate(['/question-creator', task.id]);
  }

  async confirmDeleteTask(task: Task) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.deleteTask(task);
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteTask(task: Task) {
    const allTasks: Task[] = (await this.storage.get('tasks')) || [];
    const updated = allTasks.filter((t) => t.id !== task.id);
    await this.storage.set('tasks', updated);
    await this.loadTasks();
    this.showToast('Task deleted', 'medium');
  }

  // 👇 NEW FEATURE: automatically close expired tasks
  async checkTaskDeadlines() {
    const allTasks: Task[] = (await this.storage.get('tasks')) || [];
    const now = new Date().getTime();
    let changed = false;

    for (const t of allTasks) {
      if (t.deadline && t.status !== 'closed') {
        const deadlineTime = new Date(t.deadline).getTime();
        if (now > deadlineTime) {
          t.status = 'closed';
          changed = true;
          this.showToast(
            `Task "${t.title}" has been closed (deadline reached).`,
            'warning'
          );
        }
      }
    }

    if (changed) {
      await this.storage.set('tasks', allTasks);
      await this.loadTasks();
    }
  }

  async showToast(msg: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color,
    });
    toast.present();
  }

  logout() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async viewTaskResults(task: Task) {
    const allResults = (await this.storage.get('results')) || {};
    const taskResults = allResults[task.id] || [];

    if (taskResults.length === 0) {
      this.showToast('No student results yet for this task.', 'medium');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: TaskResultsPage,
      componentProps: {
        task,
        results: taskResults,
      },
    });

    await modal.present();
  }

  renderChart(canvasId: string, percentages: number[]) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: percentages.map((_, i) => `Q${i + 1}`),
        datasets: [
          {
            label: '% Correct',
            data: percentages,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Percentage (%)' },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
}
