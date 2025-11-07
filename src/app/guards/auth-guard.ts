import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private storage: Storage) {}

  async canActivate(): Promise<boolean> {
    await this.storage.create();
    const user = await this.storage.get('currentUser');
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
