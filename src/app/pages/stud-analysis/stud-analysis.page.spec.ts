import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudAnalysisPage } from './stud-analysis.page';

describe('StudAnalysisPage', () => {
  let component: StudAnalysisPage;
  let fixture: ComponentFixture<StudAnalysisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudAnalysisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
