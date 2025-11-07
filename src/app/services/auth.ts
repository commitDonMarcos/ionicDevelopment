import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import * as CryptoJS from 'crypto-js';

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

  // Change this key to your own long, unique string for better security
  private readonly SECRET_KEY = 'the-access-hub-key-2025';

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
      console.log('No users found, seeding default admin...');
      const encryptedPassword = CryptoJS.AES.encrypt(
        'Admin',
        this.SECRET_KEY
      ).toString();

      const defaultAdmin: User = {
        id: 1,
        username: 'User',
        password: encryptedPassword,
        role: 'admin',
      };

      this.users = [defaultAdmin];
      await this._storage.set('users', this.users);
    } else {
      this.users = savedUsers;
    }
  }

  /**
   * Encrypt plain text password
   */
  encrypt(password: string): string {
    return CryptoJS.AES.encrypt(password, this.SECRET_KEY).toString();
  }

  /**
   * Decrypt AES password safely
   */
  decrypt(encrypted: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || ''; // return empty string if invalid
    } catch {
      return '';
    }
  }

  /**
   * Login logic — supports both encrypted & plaintext passwords
   */
  async login(username: string, password: string): Promise<User | null> {
    const users = (await this._storage?.get('users')) || [];
    const students = (await this._storage?.get('students')) || [];

    const allAccounts = [...users, ...students];

    const found = allAccounts.find((u: any) => {
      if (u.username !== username) return false;

      // Try decrypting (for encrypted accounts)
      const decrypted = this.decrypt(u.password);
      if (decrypted === password) return true;

      // Fallback for old plaintext passwords
      return u.password === password;
    });

    if (found) {
      const role = found.role || 'student';
      await this._storage?.set('currentUser', { ...found, role });
      this.redirectBasedOnRole(role);
      return found;
    }

    return null;
  }

  /**
   * Redirect user based on role
   */
  redirectBasedOnRole(role: string) {
    if (role === 'admin') this.navCtrl.navigateRoot('/admin');
    else if (role === 'teacher') this.navCtrl.navigateRoot('/teacher');
    else if (role === 'student') this.navCtrl.navigateRoot('/student');
  }

  /**
   * Logout and clear current user
   */
  async logout() {
    await this._storage?.remove('currentUser');
    this.navCtrl.navigateRoot('/login');
  }

  /**
   * Get currently logged-in user
   */
  async getCurrentUser(): Promise<User | null> {
    return await this._storage?.get('currentUser');
  }

  /**
   * Utility: Check if a user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const user = await this._storage?.get('currentUser');
    return !!user;
  }
}
