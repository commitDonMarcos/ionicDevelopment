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
import { Storage } from '@ionic/storage-angular';

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
  answers: number[] = []; // index chosen per question
  student: any = null;
  alreadySubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private storage: Storage,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ionViewWillEnter() {
    await this.storage.create();
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.student = (await this.storage.get('currentUser')) || null;
    await this.loadTask();
    await this.checkAlreadySubmitted();
  }

  async loadTask() {
    const tasks = (await this.storage.get('tasks')) || [];
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

    // Normalize question data to ensure compatibility
    this.questions = (this.task.questions || []).map((q: any) => ({
      text: q.text || q.question || 'Untitled Question',
      choices: q.choices || [],
      correctIndex:
        typeof q.correctIndex === 'number' ? q.correctIndex : q.correct,
    }));

    // Initialize empty answers
    this.answers = this.questions.map(() => -1);
  }

  async checkAlreadySubmitted() {
    const allResults = (await this.storage.get('results')) || {};
    const taskKey = this.taskId;
    if (!taskKey) {
      console.error('taskId is null!');
      return;
    }

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

    // validate all answered
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

    // calculate score and build answers array
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

    const submission = {
      studentId: this.student?.id,
      studentName: this.student?.studentName || this.student?.username,
      answers: answersPayload,
      score,
      submittedAt: Date.now(),
    };

    // save to results keyed by task.id
    const allResults = (await this.storage.get('results')) || {};
    const taskKey = this.taskId;
    if (!taskKey) {
      console.error('taskId is null! Cannot save results.');
      return;
    }

    const arr = allResults[taskKey] || [];
    arr.push(submission);
    allResults[taskKey] = arr;
    await this.storage.set('results', allResults);

    // show score to student
    const alert = await this.alertCtrl.create({
      header: 'Submitted',
      message: `You scored ${score} / ${this.questions.length}`,
      buttons: ['OK'],
    });
    await alert.present();

    // navigate back to student dashboard
    this.navCtrl.navigateRoot('/student');
  }
}
