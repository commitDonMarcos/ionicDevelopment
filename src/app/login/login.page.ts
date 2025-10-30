import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { IonButton, IonContent, IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonInput, IonButton, FormsModule],
})
export class LoginPage {
  username = '';
  password = '';

  constructor(private navCtrl: NavController) {}

  onLogin() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    // TODO: Authenticate user here (offline logic later)
  }
}
