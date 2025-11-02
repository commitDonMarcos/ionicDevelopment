import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ChangePasswordPage {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private storage: Storage,
    private router: Router,
    private toastController: ToastController
  ) {}

  async changePassword() {
    const currentUser = await this.storage.get('currentUser');
    const users = (await this.storage.get('users')) || [];
    const students = (await this.storage.get('students')) || [];

    console.log('Current User:', currentUser);
    console.log('Users:', users);
    console.log('Students:', students);

    if (!currentUser) {
      this.showToast('⚠️ No logged-in user found.', 'warning');
      return;
    }

    // 🔹 Determine correct collection
    let userList = [];
    let userIndex = -1;
    let keyName = '';

    if (currentUser.role === 'student') {
      userList = students;
      userIndex = students.findIndex((s: any) => s.id === currentUser.id);
      keyName = 'students';
    } else {
      userList = users;
      userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      keyName = 'users';
    }

    if (userIndex === -1) {
      this.showToast('❌ User not found.', 'danger');
      return;
    }

    if (this.oldPassword !== userList[userIndex].password) {
      this.showToast('❌ Incorrect old password.', 'danger');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showToast('⚠️ New passwords do not match.', 'warning');
      return;
    }

    // ✅ Update and save
    userList[userIndex].password = this.newPassword;
    await this.storage.set(keyName, userList);
    await this.storage.set('currentUser', userList[userIndex]);

    this.showToast('✅ Password changed successfully!', 'success');
    this.router.navigateByUrl('/student');
  }

  // ✅ Reusable toast helper
  async showToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
