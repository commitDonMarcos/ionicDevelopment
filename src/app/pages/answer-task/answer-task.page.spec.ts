import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerTaskPage } from './answer-task.page';

describe('AnswerTaskPage', () => {
  let component: AnswerTaskPage;
  let fixture: ComponentFixture<AnswerTaskPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
