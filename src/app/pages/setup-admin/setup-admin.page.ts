// src/app/pages/setup-admin/setup-admin.page.ts
import { Component } from '@angular/core';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'app-setup-admin',
  templateUrl: './setup-admin.page.html',
  styleUrls: ['./setup-admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SetupAdminPage {
  username = '';
  password = '';
  setupKey = '';
  showPassword = false;

  constructor(
    private auth: AuthService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {
    addIcons({ eye: eye, 'eye-off': eyeOff });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /* onFileSelected(e: any) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.schoolLogo = reader.result as string;
    };
    reader.readAsDataURL(file);
  } */

  async showToast(msg: string, css: string = '') {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 1600,
      position: 'top',
      cssClass: css,
    });
    await t.present();
  }

  async createAdmin() {
    if (!this.username || !this.password || !this.setupKey) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('Password must be at least 6 characters', 'danger');
      return;
    }

    const res = await this.auth.createAdminWithKey(
      this.username.trim(),
      this.password,
      this.setupKey.trim(),
      {
        schoolCode: this.setupKey.trim(),
      }
    );

    if (!res.success) {
      this.showToast(res.message || 'Failed to create admin', 'danger');
      return;
    }

    this.showToast('Admin created successfully', 'success');
    // After creation, redirect to login
    setTimeout(() => this.navCtrl.navigateRoot('/login'), 800);
  }
}
