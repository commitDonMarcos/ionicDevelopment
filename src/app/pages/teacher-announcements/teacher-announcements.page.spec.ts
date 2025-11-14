import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherAnnouncementsPage } from './teacher-announcements.page';

describe('TeacherAnnouncementsPage', () => {
  let component: TeacherAnnouncementsPage;
  let fixture: ComponentFixture<TeacherAnnouncementsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherAnnouncementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
