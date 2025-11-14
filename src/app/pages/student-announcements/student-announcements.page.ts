import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-student-announcements',
  templateUrl: './student-announcements.page.html',
  styleUrls: ['./student-announcements.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class StudentAnnouncementsPage {
  announcements: any[] = [];
  student: any = null;

  constructor(private storage: Storage) {}

  async ionViewWillEnter() {
    await this.storage.create();
    this.student = await this.storage.get('currentUser');
    this.announcements = (await this.storage.get('announcements')) || [];

    // Mark all as read for this student
    const ids = this.announcements.map((a) => a.id);
    await this.storage.set(`read_${this.student?.username}`, ids);
  }
}
