import { Component, OnInit } from '@angular/core';
import { AuthService, User } from 'src/app/services/auth';
import { Storage } from '@ionic/storage-angular';
import { addIcons } from 'ionicons';
import * as CryptoJS from 'crypto-js';
import {
  trashOutline,
  createOutline,
  chevronBackCircleOutline,
  logOutOutline,
  eyeOff,
  eye,
  gridOutline,
  closeOutline,
  person,
  personAddOutline,
} from 'ionicons/icons';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionSheetController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AdminPage implements OnInit {
  newTeacher = { username: '', password: '', subject: '' };
  teachers: User[] = [];
  adminUser: User | null = null;
  filteredTeachers: any[] = [];
  searchTerm: string = '';
  showPassword = false;
  presentingElement!: HTMLElement | null;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({
      'trash-outline': trashOutline,
      'create-outline': createOutline,
      'chevron-back-circle-outline': chevronBackCircleOutline,
      'log-out-outline': logOutOutline,
      'eye-off': eyeOff,
      eye: eye,
      'grid-outline': gridOutline,
      'close-outline': closeOutline,
      'person-add-outline': personAddOutline
    });
  }

  async ngOnInit() {
    // Initialize adminUser from AuthService or Storage
    this.presentingElement = document.querySelector('.ion-page');
    this.adminUser = await this.authService.getCurrentUser();
    await this.loadTeachers();
  }
  async ionViewWillEnter() {
    await this.loadTeachers();
  }
  // filter teachers by username or subject, and by admin
  async loadTeachers() {
    const users = (await this.storage.get('users')) || [];
    // Only show teachers created by this admin
    this.teachers = users.filter(
      (u: User) => u.role === 'teacher' && u.createdBy === this.adminUser?.id
    );
    this.filteredTeachers = [...this.teachers];
  }
  filterTeachers() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredTeachers = [...this.teachers];
      return;
    }

    this.filteredTeachers = this.teachers.filter(
      (teacher: any) =>
        teacher.username.toLowerCase().includes(term) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(term))
    );
  }

  async addTeacher() {
    if (
      !this.newTeacher.username.trim() ||
      !this.newTeacher.password.trim() ||
      !this.newTeacher.subject.trim()
    ) {
      const toast = await this.toastCtrl.create({
        message: 'All fields are required',
        position: 'top',
        duration: 2000,
        color: 'warning',
        positionAnchor: 'header',
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
        position: 'top',
        duration: 2000,
        color: 'danger',
        positionAnchor: 'header',
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
      photo: '', // no photo initially
    };

    users.push(teacher);
    await this.storage.set('users', users);
    this.newTeacher = { username: '', password: '', subject: '' };
    this.loadTeachers();

    const toast = await this.toastCtrl.create({
      message: 'Teacher added successfully',
      duration: 2000,
      position: 'top',
      color: 'success',
      positionAnchor: 'header',
    });
    toast.present();
    this.newTeacher.password = CryptoJS.AES.encrypt(
      this.newTeacher.password,
      'secret-key'
    ).toString();
  }

  async confirmDeleteTeacher(teacher: User) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Teacher',
      message: `Are you sure you want to delete ${teacher.username.toLocaleUpperCase()}?`,
      mode: 'md',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'alert-delete',
          handler: async () => {
            const users = (await this.storage.get('users')) || [];
            const updatedUsers = users.filter((u: User) => u.id !== teacher.id);
            await this.storage.set('users', updatedUsers);
            await this.loadTeachers();

            const toast = await this.toastCtrl.create({
              message: 'Teacher deleted successfully',
              duration: 2000,
              position: 'top',
              color: 'medium',
              positionAnchor: 'header',
            });
            toast.present();
          },
        },
      ],
    });

    await alert.present();
  }

  //  Edit teacher info + upload photo
  async editTeacher(teacher: User) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Teacher',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Username',
          value: teacher.username,
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password',
          value: teacher.password,
        },
        {
          name: 'subject',
          type: 'text',
          placeholder: 'Subject',
          value: teacher.subject,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Change Photo',
          handler: async () => {
            await this.pickPhoto(teacher);
            return false; // prevent alert from closing
          },
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (!data.username || !data.password || !data.subject) {
              const toast = await this.toastCtrl.create({
                message: 'All fields are required',
                duration: 2000,
                position: 'top',
                color: 'warning',
                positionAnchor: 'header',
              });
              toast.present();
              return false;
            }

            const users = (await this.storage.get('users')) || [];
            const index = users.findIndex((u: User) => u.id === teacher.id);

            if (index !== -1) {
              users[index].username = data.username;
              users[index].password = data.password;
              users[index].subject = data.subject;
              await this.storage.set('users', users);
              await this.loadTeachers();

              const toast = await this.toastCtrl.create({
                message: 'Teacher updated successfully',
                duration: 2000,
                position: 'top',
                color: 'success',
                positionAnchor: 'header',
              });
              toast.present();
              return true;
            } else {
              const toast = await this.toastCtrl.create({
                message: 'Teacher not found',
                duration: 2000,
                position: 'top',
                color: 'danger',
                positionAnchor: 'header',
              });
              toast.present();
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  //  Choose and save teacher photo
  async pickPhoto(teacher: User) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const users = (await this.storage.get('users')) || [];
        const index = users.findIndex((u: User) => u.id === teacher.id);

        if (index !== -1) {
          users[index].photo = base64;
          await this.storage.set('users', users);
          await this.loadTeachers();

          const toast = await this.toastCtrl.create({
            message: 'Photo updated successfully',
            duration: 2000,
            position: 'top',
            color: 'success',
            positionAnchor: 'header',
          });
          toast.present();
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }

  async logout() {
    await this.authService.logout();
  }

  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure want to exit?',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
        },
        {
          text: 'Stay',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };
}