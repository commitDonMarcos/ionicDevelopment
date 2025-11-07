import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage {
  username = '';
  password = '';
  showPassword = false; // 👁️ Controls password visibility

  constructor(
    private auth: AuthService, // Inject AuthService
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ eye: eye, 'eye-off': eyeOff });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async showToast(message: string, cssClass: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1000,
      position: 'top',
      cssClass,
    });
    await toast.present();
  }

  async login() {
    if (!this.username || !this.password) {
      this.showToast('Please fill out all fields.', 'warning');
      return;
    }

    // Allow "User" (admin) even with 5-character password
    if (this.username !== 'User' && this.password.length < 6) {
      this.showToast('Password must be at least 6 characters.', 'danger');
      return;
    }

    const user = await this.auth.login(this.username, this.password);

    if (user) {
      this.showToast(`Welcome back, ${user.username}`, 'success');
    } else {
      this.showToast('Invalid username or password.', 'danger');
    }
  }
}
