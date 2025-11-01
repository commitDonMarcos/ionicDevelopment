import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ToastController, AlertController } from '@ionic/angular';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonDatetime,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

interface Task {
  id: string;
  title: string;
  deadline?: string | null;
  numItems: number;
  createdAt: number;
  createdBy: number; // teacher id
  questions?: any[]; // array of question objects
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
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonButtons,
    IonAvatar,
    IonInput,
    IonDatetime,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLabel,
    IonItem,
    IonList,
    IonIcon,
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
    private alertCtrl: AlertController
  ) {
    addIcons({ 'trash-outline': trashOutline });
  }

  async ionViewWillEnter() {
    await this.loadTeacher();
    await this.loadTasks();
  }

  async loadTeacher() {
    // ensure storage is ready before accessing
    await this.storage.create();
    this.teacher = (await this.storage.get('currentUser')) || null;
  }

  async loadTasks() {
    await this.storage.create();
    const allTasks: Task[] = (await this.storage.get('tasks')) || [];
    // filter tasks created by this teacher and sort newest first
    const teacherId = this.teacher?.id;
    this.tasks = (allTasks.filter((t) => t.createdBy === teacherId) || []).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  async createTask() {
    // validate
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
      // update currentUser and users list
      const user = (await this.storage.get('currentUser')) || null;
      if (!user) return;
      user.photo = base64;
      await this.storage.set('currentUser', user);

      // update in users array too
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
    const toast = await this.toastCtrl.create({
      message: 'Task deleted',
      duration: 1500,
      color: 'medium',
    });
    toast.present();
  }

  logout() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
