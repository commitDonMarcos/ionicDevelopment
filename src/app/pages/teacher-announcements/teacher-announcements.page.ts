import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';

@Component({
  selector: 'app-teacher-announcements',
  templateUrl: './teacher-announcements.page.html',
  styleUrls: ['./teacher-announcements.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class TeacherAnnouncementsPage {
  title = '';
  message = '';
  announcements: any[] = [];

  constructor(private storage: Storage, private toastCtrl: ToastController) 
  {
    addIcons({'trash': trash})
  }

  async ionViewWillEnter() {
    await this.storage.create();
    this.announcements = (await this.storage.get('announcements')) || [];
  }

  async postAnnouncement() {
    if (!this.title.trim() || !this.message.trim()) {
      const toast = await this.toastCtrl.create({
        message: 'Please enter title and message.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: this.title,
      message: this.message,
      date: new Date().toLocaleString(),
    };

    this.announcements.unshift(newAnnouncement);
    await this.storage.set('announcements', this.announcements);

    // Clear fields
    this.title = '';
    this.message = '';

    const toast = await this.toastCtrl.create({
      message: 'Announcement posted!',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  async deleteAnnouncement(id: number) {
    this.announcements = this.announcements.filter((a) => a.id !== id);
    await this.storage.set('announcements', this.announcements);
  }
}
