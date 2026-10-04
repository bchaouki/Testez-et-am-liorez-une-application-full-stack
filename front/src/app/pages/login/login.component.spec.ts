import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { SessionService } from 'src/app/core/service/session.service';
import { AuthService } from '../../core/service/auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent (unit)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  const sessionInformation: SessionInformation = {
    token: 'token',
    type: 'Bearer',
    id: 1,
    username: 'yoga@studio.com',
    firstName: 'Admin',
    lastName: 'Admin',
    admin: true,
  };
  const authServiceMock = { login: jest.fn() };
  const sessionServiceMock = { logIn: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  const submitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form and a disabled submit button when fields are empty', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.email.hasError('required')).toBe(true);
    expect(component.form.controls.password.hasError('required')).toBe(true);
    expect(submitButton().disabled).toBe(true);
  });

  it('should reject an invalid email', () => {
    component.form.setValue({ email: 'not-an-email', password: 'secret' });

    expect(component.form.controls.email.hasError('email')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('should keep the form invalid when the password is missing', () => {
    component.form.setValue({ email: 'yoga@studio.com', password: '' });
    fixture.detectChanges();

    expect(component.form.controls.password.hasError('required')).toBe(true);
    expect(submitButton().disabled).toBe(true);
  });

  it('should enable the submit button when the form is valid', () => {
    component.form.setValue({ email: 'yoga@studio.com', password: 'test!1234' });
    fixture.detectChanges();

    expect(component.form.valid).toBe(true);
    expect(submitButton().disabled).toBe(false);
  });

  it('should log the user in and navigate to sessions on success', () => {
    authServiceMock.login.mockReturnValue(of(sessionInformation));
    component.form.setValue({ email: 'yoga@studio.com', password: 'test!1234' });

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'yoga@studio.com',
      password: 'test!1234',
    });
    expect(sessionServiceMock.logIn).toHaveBeenCalledWith(sessionInformation);
    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    expect(component.onError).toBe(false);
  });

  it('should display an error on bad credentials', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('401')));
    component.form.setValue({ email: 'yoga@studio.com', password: 'wrong' });

    component.submit();
    fixture.detectChanges();

    expect(component.onError).toBe(true);
    expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain('An error occurred');
  });

  it('should toggle password visibility', () => {
    const passwordInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[formControlName="password"]');
    expect(passwordInput.type).toBe('password');

    fixture.nativeElement.querySelector('button[mat-icon-button]').click();
    fixture.detectChanges();

    expect(component.hide).toBe(false);
    expect(passwordInput.type).toBe('text');
  });
});
