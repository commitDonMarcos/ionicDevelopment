import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

Chart.register(...registerables);

@Component({
  selector: 'app-task-results',
  templateUrl: './task-results.page.html',
  styleUrls: ['./task-results.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, IonHeader, IonTitle, IonButton, IonButtons, IonToolbar, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent],
})
export class TaskResultsPage implements AfterViewInit {
  @Input() task: any;
  @Input() results: any[] = [];

  highestStudent = '';
  highestScore = 0;
  passedCount = 0;
  percentages: number[] = [];
  totalStudents = 0;

  constructor(private modalCtrl: ModalController) {}

  ngAfterViewInit() {
    this.calculateStats();
    this.renderChart();
  }

  calculateStats() {
    if (!this.results || this.results.length === 0) return;

    const numItems = this.task.numItems;
    this.totalStudents = this.results.length;
    const correctCounts = Array(numItems).fill(0);

    for (const r of this.results) {
      let score = 0;
      for (let i = 0; i < numItems; i++) {
        if (r.answers && r.answers[i]?.isCorrect) {
          correctCounts[i]++;
          score++;
        }
      }
      if (score > this.highestScore) {
        this.highestScore = score;
        this.highestStudent = r.studentName;
      }
      if (score / numItems >= 0.5) this.passedCount++;
    }

    this.percentages = correctCounts.map((c) =>
      Math.round((c / this.totalStudents) * 100)
    );
  }

  renderChart() {
    const ctx = document.getElementById('resultsChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.percentages.map((_, i) => `Q${i + 1}`),
        datasets: [
          {
            label: '% Correct',
            data: this.percentages,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Percentage (%)' },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
