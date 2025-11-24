import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from 'src/app/services/auth';
import {
  IonicModule,
  ModalController,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
@Component({
  selector: 'app-teacher-students',
  templateUrl: './teacher-students.page.html',
  styleUrls: ['./teacher-students.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class TeacherStudentsPage {
  students: any[] = [];
  newStudent = { name: '', username: '', password: '' };
  teacher: any;
  adminUser: User | null = null;

  constructor(
    private modalCtrl: ModalController,
    private storage: Storage,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    await this.storage.create();
    this.teacher = await this.storage.get('currentUser');
    await this.loadStudents();
  }

  async loadStudents() {
    const allStudents = (await this.storage.get('students')) || [];
    this.students = allStudents.filter(
      (s: any) => s.teacherId === this.teacher.id
    );
  }

  async addStudent() {
    if (
      !this.newStudent.name ||
      !this.newStudent.username ||
      !this.newStudent.password
    ) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill all fields.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const allStudents = (await this.storage.get('students')) || [];
    const id = Date.now();
    const newS = {
      id,
      studentName: this.newStudent.name.trim(),
      username: this.newStudent.username.trim(),
      password: this.newStudent.password,
      teacherId: this.teacher.id,
    };

    allStudents.push(newS);
    await this.storage.set('students', allStudents);
    this.newStudent = { name: '', username: '', password: '' };
    await this.loadStudents();

    const toast = await this.toastCtrl.create({
      message: 'Student added successfully!',
      duration: 1500,
      color: 'success',
    });
    toast.present();
  }

  async deleteStudent(student: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Delete ${student.studentName}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const allStudents = (await this.storage.get('students')) || [];
            const updated = allStudents.filter((s: any) => s.id !== student.id);
            await this.storage.set('students', updated);
            await this.loadStudents();
          },
        },
      ],
    });
    await alert.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
