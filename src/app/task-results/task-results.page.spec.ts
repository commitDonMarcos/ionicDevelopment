import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskResultsPage } from './task-results.page';

describe('TaskResultsPage', () => {
  let component: TaskResultsPage;
  let fixture: ComponentFixture<TaskResultsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskResultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
