import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';

import { RegisterComponent } from './register.component';

describe('RegisterComponent (unit)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  const authServiceMock = { register: jest.fn() };
  const validForm = {
    email: 'john@doe.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'secret',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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

  it('should have a disabled submit button when the form is empty', () => {
    expect(component.form.invalid).toBe(true);
    expect(submitButton().disabled).toBe(true);
  });

  it.each(['email', 'firstName', 'lastName', 'password'] as const)(
    'should keep the form invalid when %s is missing',
    (field) => {
      component.form.setValue({ ...validForm, [field]: '' });
      fixture.detectChanges();

      expect(component.form.controls[field].hasError('required')).toBe(true);
      expect(submitButton().disabled).toBe(true);
    }
  );

  it('should enable the submit button when the form is valid', () => {
    component.form.setValue(validForm);
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(false);
  });

  it('should register the user and navigate to login on success', () => {
    authServiceMock.register.mockReturnValue(of(undefined));
    component.form.setValue(validForm);

    component.submit();

    expect(authServiceMock.register).toHaveBeenCalledWith(validForm);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  });

  it('should display an error when the registration fails', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('400')));
    component.form.setValue(validForm);

    component.submit();
    fixture.detectChanges();

    expect(component.onError).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain('An error occurred');
  });
});
