import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherStudentsPage } from './teacher-students.page';

describe('TeacherStudentsPage', () => {
  let component: TeacherStudentsPage;
  let fixture: ComponentFixture<TeacherStudentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherStudentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
