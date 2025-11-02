import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-student-analysis',
  templateUrl: './stud-analysis.page.html',
  styleUrls: ['./stud-analysis.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class StudentAnalysisPage {
  taskId!: string | null;
  task: any = null;
  resultsForTask: any[] = [];
  totalStudents = 0;
  perQuestionCounts: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private storage: Storage,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter() {
    await this.storage.create();
    this.taskId = this.route.snapshot.paramMap.get('id');
    await this.loadData();
  }

  async loadData() {
    const tasks = (await this.storage.get('tasks')) || [];
    this.task = tasks.find((t: any) => t.id === this.taskId) || null;

    const allResults = (await this.storage.get('results')) || {};

    const taskKey = this.taskId;
    if (!taskKey) {
      console.error('taskId is null! Cannot load results.');
      this.resultsForTask = [];
      this.totalStudents = 0;
      this.perQuestionCounts = [];
      return;
    }

    this.resultsForTask = allResults[taskKey] || [];

    this.totalStudents = this.resultsForTask.length;
    const numItems = this.task?.numItems || 0;
    this.perQuestionCounts = Array(numItems).fill(0);

    for (const r of this.resultsForTask) {
      for (const a of r.answers) {
        if (a.isCorrect)
          this.perQuestionCounts[a.questionIndex] =
            (this.perQuestionCounts[a.questionIndex] || 0) + 1;
      }
    }
  }

  percentCorrect(index: number) {
    if (this.totalStudents === 0) return 0;
    return Math.round(
      (this.perQuestionCounts[index] / this.totalStudents) * 100
    );
  }

  back() {
    this.navCtrl.back();
  }
}
