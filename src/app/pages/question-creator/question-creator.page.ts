import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ToastController } from '@ionic/angular';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonRadio,
  IonInput,
  IonTextarea,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
  IonAccordionGroup,
} from '@ionic/angular/standalone';

interface Task {
  id: string;
  title: string;
  deadline?: string | null;
  numItems: number;
  createdAt: number;
  createdBy: number;
  questions?: any[];
}

@Component({
  selector: 'app-question-creator',
  templateUrl: './question-creator.page.html',
  styleUrls: ['./question-creator.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonRadioGroup,
    IonButton,
    IonRadio,
  ],
})
export class QuestionCreatorPage {
  task: Task | null = null;
  questions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private storage: Storage,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (!taskId) return;
    // ensure storage DB is ready
    await this.storage.create();
    const allTasks: Task[] = (await this.storage.get('tasks')) || [];
    const found = allTasks.find((t) => t.id === taskId);
    if (!found) return;
    this.task = found;
    // if questions already exist, preload them; otherwise create empty template
    if (found.questions && found.questions.length === found.numItems) {
      this.questions = JSON.parse(JSON.stringify(found.questions));
    } else {
      this.questions = [];
      for (let i = 0; i < found.numItems; i++) {
        this.questions.push({
          text: '',
          choices: ['', '', '', ''],
          correctIndex: 0,
        });
      }
    }
  }

  choiceLabel(index: number) {
    return ['A', 'B', 'C', 'D'][index] || String.fromCharCode(65 + index);
  }

  // trackBy for outer questions loop to avoid recreating DOM nodes on model updates
  trackByQuestion(index: number, item: any) {
    return index;
  }

  // trackBy for inner choices loop
  trackByChoice(index: number, item: any) {
    return index;
  }

  async saveQuestions() {
    // basic validation
    for (let i = 0; i < this.questions.length; i++) {
      const q = this.questions[i];
      if (!q.text?.trim()) {
        const t = await this.toastCtrl.create({
          message: `Question ${i + 1} text is required`,
          duration: 1800,
          color: 'warning',
        });
        t.present();
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.choices[j]?.trim()) {
          const t = await this.toastCtrl.create({
            message: `All choices for Question ${i + 1} are required`,
            duration: 1800,
            color: 'warning',
          });
          t.present();
          return;
        }
      }
      if (typeof q.correctIndex !== 'number') {
        const t = await this.toastCtrl.create({
          message: `Select correct answer for Question ${i + 1}`,
          duration: 1800,
          color: 'warning',
        });
        t.present();
        return;
      }
    }

    // save to tasks
    await this.storage.create();
    const allTasks: Task[] = (await this.storage.get('tasks')) || [];
    const idx = allTasks.findIndex((t) => t.id === this.task!.id);
    if (idx === -1) {
      const t = await this.toastCtrl.create({
        message: 'Task not found',
        duration: 1800,
        color: 'danger',
      });
      t.present();
      return;
    }

    allTasks[idx].questions = JSON.parse(JSON.stringify(this.questions));
    await this.storage.set('tasks', allTasks);

    const toast = await this.toastCtrl.create({
      message: 'Questions saved',
      duration: 1500,
      color: 'success',
    });
    toast.present();

    // navigate back to teacher dashboard
    this.router.navigateByUrl('/teacher');
  }
}
