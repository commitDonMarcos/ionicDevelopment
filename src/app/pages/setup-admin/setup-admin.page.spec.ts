import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetupAdminPage } from './setup-admin.page';

describe('SetupAdminPage', () => {
  let component: SetupAdminPage;
  let fixture: ComponentFixture<SetupAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
