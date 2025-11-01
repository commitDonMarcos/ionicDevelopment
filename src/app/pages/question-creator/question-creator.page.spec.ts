import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionCreatorPage } from './question-creator.page';

describe('QuestionCreatorPage', () => {
  let component: QuestionCreatorPage;
  let fixture: ComponentFixture<QuestionCreatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionCreatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
