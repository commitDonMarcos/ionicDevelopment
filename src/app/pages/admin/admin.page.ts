import { Component, OnInit } from '@angular/core';
import { AuthService, User } from 'src/app/services/auth';
import { Storage } from '@ionic/storage-angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { ToastController, AlertController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonListHeader,
    CommonModule,
    FormsModule,
    IonIcon,
  ],
  standalone: true,
})
export class AdminPage implements OnInit {
  newTeacher = { username: '', password: '', subject: '' };
  teachers: User[] = [];
  adminUser: User | null = null;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ 'trash-outline': trashOutline });
  }

  async ngOnInit() {
    await this.loadTeachers();
    this.adminUser = await this.authService.getCurrentUser();
  }

  async loadTeachers() {
    const users = (await this.storage.get('users')) || [];
    this.teachers = users.filter((u: User) => u.role === 'teacher');
  }

  async addTeacher() {
    // ✅ Validate all fields
    if (
      !this.newTeacher.username.trim() ||
      !this.newTeacher.password.trim() ||
      !this.newTeacher.subject.trim()
    ) {
      const toast = await this.toastCtrl.create({
        message: 'All fields are required',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const users = (await this.storage.get('users')) || [];
    const exists = users.find(
      (u: User) => u.username === this.newTeacher.username
    );

    if (exists) {
      const toast = await this.toastCtrl.create({
        message: 'Username already exists',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
      return;
    }

    const newId = users.length + 1;
    const teacher: User = {
      id: newId,
      username: this.newTeacher.username,
      password: this.newTeacher.password,
      role: 'teacher',
      createdBy: this.adminUser?.id,
      subject: this.newTeacher.subject,
    };

    users.push(teacher);
    await this.storage.set('users', users);
    this.newTeacher = { username: '', password: '', subject: '' };
    this.loadTeachers();

    const toast = await this.toastCtrl.create({
      message: 'Teacher added successfully',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  // Updated delete function using AlertController
  async confirmDeleteTeacher(teacher: User) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${teacher.username}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const users = (await this.storage.get('users')) || [];
            const updatedUsers = users.filter((u: User) => u.id !== teacher.id);

            await this.storage.set('users', updatedUsers);
            await this.loadTeachers();

            const toast = await this.toastCtrl.create({
              message: 'Teacher deleted successfully',
              duration: 2000,
              color: 'medium',
            });
            toast.present();
          },
        },
      ],
    });

    await alert.present();
  }

  async logout() {
    await this.authService.logout();
  }
}
