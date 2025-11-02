import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student',
  templateUrl: './student.page.html',
  styleUrls: ['./student.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class StudentPage {
  student: any = null;
  tasks: any[] = [];

  constructor(
    private storage: Storage,
    private router: Router,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter() {
    await this.storage.create();
    this.student = (await this.storage.get('currentUser')) || null;
    await this.loadTasks();
  }

  // Load only tasks created by this student's teacher and not closed
  async loadTasks() {
    const allTasks: any[] = (await this.storage.get('tasks')) || [];
    const teacherId =
      this.student?.createdBy || this.student?.teacherId || null;
    if (!teacherId) {
      this.tasks = [];
      return;
    }

    // filter open tasks and also include tasks with no deadline (open)
    const now = Date.now();
    this.tasks = (allTasks || [])
      .filter((t) => t.createdBy === teacherId)
      .map((t) => {
        // compute closed status if missing (defensive)
        const closed =
          t.status === 'closed' ||
          (t.deadline && now > new Date(t.deadline).getTime());
        return { ...t, status: closed ? 'closed' : 'open' };
      })
      .filter((t) => t.status !== 'closed') // show only open tasks
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Open answer page
  takeTask(task: any) {
    this.router.navigateByUrl(`/answer-task/${task.id}`);
  }

  // view analysis table (student view)
  viewAnalysis(task: any) {
    this.router.navigateByUrl(`/student-analysis/${task.id}`);
  }

  // optional: view student's own submissions
  async viewMyResults() {
    this.router.navigateByUrl('/student-results');
  }

  logout() {
    this.storage.remove('currentUser');
    this.navCtrl.navigateRoot('/login');
  }
}
