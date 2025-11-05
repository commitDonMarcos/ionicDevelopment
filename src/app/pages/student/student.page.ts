import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student',
  templateUrl: './student.page.html',
  styleUrls: ['./student.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class StudentPage {
  student: any = null;
  tasks: any[] = [];
  results: any[] = [];
  pastTasks: any[] = []; // 🔹 added

  constructor(
    private storage: Storage,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  async debugStorage() {
    await this.storage.create();
/*     console.log('Users:', await this.storage.get('users'));
    console.log('Current User:', await this.storage.get('currentUser'));
 */  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current Password',
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password',
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm New Password',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Update',
          handler: async (data) => {
            const { currentPassword, newPassword, confirmPassword } = data;

            // validate inputs
            if (!currentPassword || !newPassword || !confirmPassword) {
              this.showToast('Please fill in all fields', 'warning');
              return false;
            }

            if (newPassword !== confirmPassword) {
              this.showToast('Passwords do not match', 'danger');
              return false;
            }

            if (this.student?.password !== currentPassword) {
              this.showToast('Incorrect current password', 'danger');
              return false;
            }

            // update password in storage
            const users = (await this.storage.get('users')) || [];
            const index = users.findIndex((u: any) => u.id === this.student.id);

            if (index !== -1) {
              users[index].password = newPassword;
              await this.storage.set('users', users);
              this.student.password = newPassword;
              await this.storage.set('currentUser', this.student);
              this.showToast('Password updated successfully', 'success');
            } else {
              this.showToast('User not found', 'danger');
            }

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  // 🔹 Helper for quick toasts
  async showToast(message: string, color: string = 'primary') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2000;
    toast.color = color;
    document.body.appendChild(toast);
    await toast.present();
  }

  async ionViewWillEnter() {
    await this.storage.create();
    this.student = (await this.storage.get('currentUser')) || null;
    await this.loadTasks();
    await this.loadResults();
    this.debugStorage();
  }

  goToChangePassword() {
    this.router.navigateByUrl('/change-password');
  }

  async loadTasks() {
    const allTasks: any[] = (await this.storage.get('tasks')) || [];
    const teacherId =
      this.student?.createdBy || this.student?.teacherId || null;

    if (!teacherId) {
      this.tasks = [];
      this.pastTasks = [];
      return;
    }

    const now = Date.now();
    const teacherTasks = allTasks.filter((t) => t.createdBy === teacherId);

    // 🔹 Separate open and past (expired/closed) tasks
    this.tasks = teacherTasks
      .filter(
        (t) =>
          t.status !== 'closed' &&
          (!t.deadline || now <= new Date(t.deadline).getTime())
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    this.pastTasks = teacherTasks
      .filter(
        (t) =>
          t.status === 'closed' ||
          (t.deadline && now > new Date(t.deadline).getTime())
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async loadResults() {
    const allResults =
      (await this.storage.get('studentResults')) ||
      (await this.storage.get('results')) ||
      [];
    if (this.student) {
      this.results = allResults.filter(
        (r: any) => r.studentId === this.student.id
      );
    }
  }

  getResultForTask(taskId: string) {
    return this.results.find((r) => r.taskId === taskId);
  }

  takeTask(task: any) {
    this.router.navigateByUrl(`/answer-task/${task.id}`);
  }

  viewAnalysis(task: any) {
    this.router.navigateByUrl(`/student-analysis/${task.id}`);
  }

  logout() {
    this.storage.remove('currentUser');
    this.navCtrl.navigateRoot('/login');
  }
}
