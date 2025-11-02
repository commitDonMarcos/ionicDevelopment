import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  subject?: string;
  createdBy?: number;
  photo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _storage: Storage | null = null;
  private users: User[] = [];

  constructor(private storage: Storage, private navCtrl: NavController) {
    this.init();
  }

  async init() {
    // Initialize Ionic Storage
    const storage = await this.storage.create();
    this._storage = storage;

    // Load existing users or seed a default admin
    const savedUsers = await this._storage.get('users');
    if (!savedUsers) {
      const defaultAdmin: User = {
        id: 1,
        username: 'User',
        password: 'Admin',
        role: 'admin',
      };
      this.users = [defaultAdmin];
      await this._storage.set('users', this.users);
    } else {
      this.users = savedUsers;
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    const users = (await this._storage?.get('users')) || [];
    const students = (await this._storage?.get('students')) || [];

    // Combine both lists (admin, teacher, student)
    const allAccounts = [...users, ...students];

    const found = allAccounts.find(
      (u: any) => u.username === username && u.password === password
    );

    if (found) {
      // Default to 'student' if no role
      const role = found.role || 'student';
      await this._storage?.set('currentUser', { ...found, role });
      this.redirectBasedOnRole(role);
      return found;
    }

    return null;
  }

  redirectBasedOnRole(role: string) {
    if (role === 'admin') this.navCtrl.navigateRoot('/admin');
    else if (role === 'teacher') this.navCtrl.navigateRoot('/teacher');
    else if (role === 'student') this.navCtrl.navigateRoot('/student');
  }

  async logout() {
    await this._storage?.remove('currentUser');
    this.navCtrl.navigateRoot('/login');
  }

  async getCurrentUser(): Promise<User | null> {
    return await this._storage?.get('currentUser');
  }
}
