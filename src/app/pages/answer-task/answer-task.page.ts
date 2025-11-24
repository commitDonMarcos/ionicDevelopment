// src/app/pages/answer-task/answer-task.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  AlertController,
  NavController,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-answer-task',
  templateUrl: './answer-task.page.html',
  styleUrls: ['./answer-task.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AnswerTaskPage {
  taskId!: string | null;
  task: any = null;
  questions: any[] = [];
  answers: number[] = [];
  student: any = null;
  alreadySubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter() {
    await this.auth.init?.();
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.student = (await this.auth.getCurrentUser()) || null;
    await this.loadTask();
    await this.checkAlreadySubmitted();
  }

  async loadTask() {
    const tasks = (await (this.auth as any)._storage.get('tasks')) || [];
    this.task = tasks.find((t: any) => t.id == this.taskId) || null;

    if (!this.task) {
      const a = await this.alertCtrl.create({
        header: 'Not found',
        message: 'Task not found',
        buttons: ['OK'],
      });
      await a.present();
      this.navCtrl.back();
      return;
    }

    this.questions = (this.task.questions || []).map((q: any) => ({
      text: q.text || q.question || 'Untitled Question',
      choices: q.choices || [],
      correctIndex:
        typeof q.correctIndex === 'number' ? q.correctIndex : q.correct,
    }));

    this.answers = this.questions.map(() => -1);
  }

  async checkAlreadySubmitted() {
    const allResults = (await (this.auth as any)._storage.get('results')) || {};
    const taskKey = this.taskId as string;
    if (!taskKey) return;
    const resultsForTask = allResults[taskKey] || [];
    const found = resultsForTask.find(
      (r: any) =>
        r.studentId === this.student?.id ||
        r.studentName === this.student?.username
    );

    if (found) {
      this.alreadySubmitted = true;
      const t = await this.toastCtrl.create({
        message: 'You already submitted this task.',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
    }
  }

  selectAnswer(qIndex: number, choiceIndex: number) {
    this.answers[qIndex] = choiceIndex;
  }

  async submit() {
    if (this.alreadySubmitted) {
      const t = await this.toastCtrl.create({
        message: 'You already submitted this task.',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
      return;
    }

    // validate answers
    for (let i = 0; i < this.questions.length; i++) {
      if (this.answers[i] === -1) {
        const to = await this.toastCtrl.create({
          message: `Please answer question ${i + 1}`,
          duration: 1500,
          color: 'warning',
        });
        await to.present();
        return;
      }
    }

    // calculate score & prepare answers payload
    let score = 0;
    const answersPayload: any[] = [];
    for (let i = 0; i < this.questions.length; i++) {
      const q = this.questions[i];
      const chosen = this.answers[i];
      const isCorrect =
        typeof q.correctIndex === 'number' ? chosen === q.correctIndex : false;
      if (isCorrect) score++;
      answersPayload.push({
        questionIndex: i,
        chosenOption: chosen,
        isCorrect,
      });
    }

    const total = this.questions.length;
    const passed = score >= total / 2;

    const submission = {
      studentId: this.student?.id,
      studentName: this.student?.studentName || this.student?.username,
      taskId: this.taskId,
      score,
      total,
      passed,
      answers: answersPayload,
      date: Date.now(),
    };

    // --- SAVE via AuthService ----
    await this.auth.saveTaskResult(
      this.taskId as string,
      this.student?.id,
      submission
    );

    // Optional: also save to studentResults array for student history if your app uses that
    const studentResults =
      (await (this.auth as any)._storage.get('studentResults')) || [];
    studentResults.push(submission);
    await (this.auth as any)._storage.set('studentResults', studentResults);

    // show result to student
    const alert = await this.alertCtrl.create({
      header: 'Submitted',
      message: `You scored ${score} / ${total} (${
        passed ? '✅ Passed' : '❌ Failed'
      })`,
      buttons: ['OK'],
    });
    await alert.present();

    // navigate back to student dashboard
    this.navCtrl.navigateRoot('/student');
  }
}
