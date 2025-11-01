import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth';
import {
  IonButton,
  IonContent,
  IonInput,
  IonNote,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonInput,
    IonButton,
    FormsModule,
    CommonModule,
    IonNote,
  ],
})
export class LoginPage {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  async onLogin() {
    this.errorMessage = '';
    const user = await this.authService.login(this.username, this.password);

    if (!user) {
      setTimeout(() => {
        this.errorMessage = '';
      }, 2000);
      this.errorMessage = 'Invalid username or password';
      this.password = '';

      /* const toast = await this.toastCtrl.create({
        message: this.errorMessage,
        duration: 2000,
        color: 'danger',
        position: 'top',
      });

      await toast.present(); */
    }
  }
}
