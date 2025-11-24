// src/app/pages/task-results/task-results.page.ts
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth';

// CHART.JS IMPORTS
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';

// REGISTER CHART.JS COMPONENTS
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement
);

@Component({
  selector: 'app-task-results',
  templateUrl: './task-results.page.html',
  styleUrls: ['./task-results.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class TaskResultsPage {
  @Input() taskId: string = '';

  results: any[] = [];
  totalStudents = 0;
  highestScore = -1;
  highestStudent = '';
  percentPerItem: number[] = [];
  itemCorrectCounts: number[] = [];

  mps: number = 0;
  mpl: number = 0;
  mplPercent: number = 0;

  chart: any;

  constructor(private auth: AuthService, private modalCtrl: ModalController) {}

  // IMPORTANT: Use ionViewDidEnter so canvas exists
  async ionViewDidEnter() {
    if (this.taskId) {
      await this.load(this.taskId);
      setTimeout(() => this.renderChart(), 200);
    }
  }

  async load(taskId: string) {
    this.results = (await this.auth.getResultsForTask(taskId)) || [];
    this.totalStudents = this.results.length;

    if (this.totalStudents === 0) return;

    const numItems =
      this.results[0]?.total || this.results[0]?.answers?.length || 0;

    const correctCounts = Array(numItems).fill(0);
    let totalRaw = 0;
    let totalPossible = numItems * this.totalStudents;
    let learnersAboveMPL = 0;
    this.mpl = Math.ceil(numItems * 0.6);

    for (const r of this.results) {
      totalRaw += r.score;

      if (r.score >= this.mpl) learnersAboveMPL++;

      if (r.score > this.highestScore) {
        this.highestScore = r.score;
        this.highestStudent = r.studentName || r.studentId;
      }

      for (let i = 0; i < (r.answers || []).length; i++) {
        if (r.answers[i]?.isCorrect) correctCounts[i]++;
      }
    }

    this.itemCorrectCounts = correctCounts;
    this.percentPerItem = correctCounts.map((c) =>
      Math.round((c / this.totalStudents) * 100)
    );

    this.mps = Math.round((totalRaw / totalPossible) * 100);
    this.mplPercent = Math.round((learnersAboveMPL / this.totalStudents) * 100);
  }

  renderChart() {
    const canvas = document.getElementById('taskChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.percentPerItem.map((_, i) => `Q${i + 1}`),
        datasets: [
          {
            label: 'Percent Correct per Item',
            data: this.percentPerItem,
            borderWidth: 1,
          },
          {
            label: 'MPL (60%) Line',
            data: this.percentPerItem.map(() => 60),
            type: 'line',
            pointRadius: 3,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
