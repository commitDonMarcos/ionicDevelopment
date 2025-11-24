// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import * as CryptoJS from 'crypto-js';

export interface User {
  id: number | string;
  username: string;
  password: string; // encrypted
  role: 'admin' | 'teacher' | 'student';
  subject?: string;
  createdBy?: number | string;
  photo?: string;
  schoolName?: string;
  schoolCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _storage: Storage | null = null;
  private users: User[] = [];

  // Change these BEFORE you distribute the app.
  private readonly SECRET_KEY = 'CHANGE_THIS_LONG_RANDOM_SECRET';
  // Valid setup keys to each school
  private readonly VALID_SETUP_KEYS: string[] = [
    'SCHOOL-ACCESS-2025-AB12',
    'SCHOOL-ACCESS-2025-CD77',
    'SCHOOL-ACCESS-2025-EF34',
    'SCHOOL-ACCESS-2025-GH56',
  ];

  constructor(private storage: Storage, private navCtrl: NavController) {
    this.init();
  }

  public async init() {
    const s = await this.storage.create();
    this._storage = s;
    const savedUsers = (await this._storage.get('users')) || [];
    this.users = savedUsers;
    // Defensive: filter out null/invalid entries
    this.users = (this.users || []).filter((u) => !!u && !!u.username);
    await this._storage.set('users', this.users);
    // Ensure other keys exist so other pages don't crash
    const keys = [
      'students',
      'announcements',
      'tasks',
      'results',
      'studentResults',
    ];
    for (const k of keys) {
      const v = await this._storage.get(k);
      if (v === null || typeof v === 'undefined')
        await this._storage.set(k, k === 'results' ? {} : []);
    }
  }

  encrypt(password: string): string {
    return CryptoJS.AES.encrypt(password, this.SECRET_KEY).toString();
  }

  decrypt(encrypted: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || '';
    } catch {
      return '';
    }
  }

  // -----------------------
  // Admin / Teacher / Student
  // -----------------------

  async createAdminWithKey(
    username: string,
    password: string,
    setupKey: string,
    opts?: { schoolCode?: string }
  ): Promise<{ success: boolean; message?: string }> {
    await this._ensureStorage();

    if (!username || !password || !setupKey) {
      return { success: false, message: 'Missing required fields.' };
    }

    if (!this.VALID_SETUP_KEYS.includes(setupKey)) {
      return { success: false, message: 'Invalid setup key.' };
    }

    const hasAdmin = this.users.some(
      (u) => u.role === 'admin' && u.schoolCode === opts?.schoolCode
    );
    if (hasAdmin) {
      return {
        success: false,
        message: 'Admin already exists for this school/device.',
      };
    }

    const encrypted = this.encrypt(password);
    const newAdmin: User = {
      id: Date.now(),
      username,
      password: encrypted,
      role: 'admin',
      schoolCode: opts?.schoolCode || setupKey,
    };

    this.users.push(newAdmin);
    await this.storage.set('users', this.users);

    return { success: true };
  }

  async login(username: string, password: string): Promise<User | null> {
    await this._ensureStorage();

    const users = (await this.storage.get('users')) || [];
    const students = (await this.storage.get('students')) || [];

    const allAccounts = [...users, ...students];

    const found = (allAccounts || []).find((u: any) => {
      if (!u || u.username !== username) return false;
      const decrypted = this.decrypt(u.password);
      if (decrypted === password) return true;
      return u.password === password;
    });

    if (found) {
      const role = found.role || 'student';
      await this.storage.set('currentUser', { ...found, role });
      this.redirectBasedOnRole(role);
      return found;
    }

    return null;
  }

  async redirectBasedOnRole(role: string) {
    if (role === 'admin') this.navCtrl.navigateRoot('/admin');
    else if (role === 'teacher') this.navCtrl.navigateRoot('/teacher');
    else this.navCtrl.navigateRoot('/student');
  }

  async logout() {
    await this._storage?.remove('currentUser');
    this.navCtrl.navigateRoot('/login');
  }

  async getCurrentUser(): Promise<User | null> {
    await this._ensureStorage();
    return (await this._storage?.get('currentUser')) || null;
  }

  async isAdminExistsForKey(setupKey?: string): Promise<boolean> {
    await this._ensureStorage();
    if (!setupKey) {
      return this.users.some((u) => u.role === 'admin');
    } else {
      return this.users.some(
        (u) => u.role === 'admin' && u.schoolCode === setupKey
      );
    }
  }

  async resetAdmins(
    admins: Array<{
      username: string;
      password: string;
      schoolCode?: string;
    }>
  ) {
    await this._ensureStorage();
    let users = (await this.storage.get('users')) || [];
    users = users.filter((u: any) => u.role !== 'admin');
    for (const opts of admins) {
      const encrypted = this.encrypt(opts.password);
      const newAdmin: User = {
        id: users.length + 1,
        username: opts.username,
        password: encrypted,
        role: 'admin',
        schoolCode: opts.schoolCode,
      };
      users.push(newAdmin);
    }
    await this.storage.set('users', users);
  }

  private async _ensureStorage() {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  // -------------------- RESULTS STORAGE --------------------
  // Save a single student's submission for a task (replaces any previous attempt of same student)
  async saveTaskResult(taskId: string, studentId: string | number, data: any) {
    await this._ensureStorage();

    const all = (await this.storage.get('results')) || {};

    if (!all[taskId]) all[taskId] = [];

    // remove old attempt from same student
    all[taskId] = all[taskId].filter((r: any) => r.studentId !== studentId);

    all[taskId].push({
      studentId,
      studentName: data.studentName,
      score: data.score,
      total: data.total,
      answers: data.answers, // expected format: [{ questionIndex, chosenOption, isCorrect }]
      date: Date.now(),
    });

    await this.storage.set('results', all);
    return true;
  }

  // Get results array for a specific task
  async getResultsForTask(taskId: string) {
    await this._ensureStorage();
    const all = (await this.storage.get('results')) || {};
    return all[taskId] || [];
  }
}
