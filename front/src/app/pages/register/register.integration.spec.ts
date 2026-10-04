import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { IntegrationContext, settle, setupIntegration, typeInto } from 'src/testing/integration.helpers';

import { RegisterComponent } from './register.component';

describe('Register (integration)', () => {
  let ctx: IntegrationContext;
  let root: HTMLElement;

  beforeEach(async () => {
    ctx = await setupIntegration();
    await ctx.harness.navigateByUrl('/register', RegisterComponent);
    root = ctx.harness.routeNativeElement!;
  });

  afterEach(() => ctx.httpMock.verify());

  const submitButton = (): HTMLButtonElement => root.querySelector('button[type="submit"]')!;

  const fillForm = (values: Partial<Record<'firstName' | 'lastName' | 'email' | 'password', string>>): void => {
    Object.entries(values).forEach(([field, value]) =>
      typeInto(root, `input[formControlName="${field}"]`, value)
    );
    ctx.harness.detectChanges();
  };

  const completeForm = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    password: 'secret123',
  };

  it('should create the account and redirect to the login page', async () => {
    fillForm(completeForm);
    submitButton().click();

    const req = ctx.httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(completeForm);
    req.flush(null);
    await settle(ctx.harness);

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(ctx.harness.routeNativeElement!.textContent).toContain('Login');
  });

  it('should display an error when the account cannot be created', async () => {
    fillForm(completeForm);
    submitButton().click();

    ctx.httpMock
      .expectOne('/api/auth/register')
      .flush({ message: 'Email already taken' }, { status: 400, statusText: 'Bad Request' });
    await settle(ctx.harness);

    expect(root.querySelector('.error')!.textContent).toContain('An error occurred');
    expect(TestBed.inject(Router).url).toBe('/register');
  });

  it.each(['firstName', 'lastName', 'email', 'password'] as const)(
    'should keep the submit button disabled when %s is missing',
    (missing) => {
      const { [missing]: _omitted, ...partial } = completeForm;
      fillForm(partial);

      expect(submitButton().disabled).toBe(true);
    }
  );
});
