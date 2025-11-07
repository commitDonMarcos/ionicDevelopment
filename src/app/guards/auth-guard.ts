import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private storage: Storage) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    await this.storage.create();
    const user = await this.storage.get('currentUser');

    //  No user = redirect to login
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    //  Role-based protection
    const allowedRoles = route.data['roles'] as string[];
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      //  User role not authorized
      if (user.role === 'admin') this.router.navigate(['/admin']);
      else if (user.role === 'teacher') this.router.navigate(['/teacher']);
      else if (user.role === 'student') this.router.navigate(['/student']);
      else this.router.navigate(['/login']);
      return false;
    }

    return true; //  Access granted
  }
}
