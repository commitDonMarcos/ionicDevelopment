import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherPage } from './teacher.page';

describe('TeacherPage', () => {
  let component: TeacherPage;
  let fixture: ComponentFixture<TeacherPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
