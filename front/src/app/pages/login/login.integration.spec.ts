import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import {
  adminSession,
  IntegrationContext,
  sessions,
  settle,
  setupIntegration,
  typeInto,
} from 'src/testing/integration.helpers';

import { LoginComponent } from './login.component';

describe('Login (integration)', () => {
  let ctx: IntegrationContext;
  let root: HTMLElement;

  beforeEach(async () => {
    ctx = await setupIntegration();
    await ctx.harness.navigateByUrl('/login', LoginComponent);
    root = ctx.harness.routeNativeElement!;
  });

  afterEach(() => ctx.httpMock.verify());

  const submitButton = (): HTMLButtonElement => root.querySelector('button[type="submit"]')!;

  it('should log in, store the session and redirect to the sessions list', async () => {
    typeInto(root, 'input[formControlName="email"]', 'yoga@studio.com');
    typeInto(root, 'input[formControlName="password"]', 'test!1234');
    ctx.harness.detectChanges();
    submitButton().click();

    const req = ctx.httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'yoga@studio.com', password: 'test!1234' });
    req.flush(adminSession);
    await settle(ctx.harness);

    expect(ctx.sessionService.isLogged).toBe(true);
    expect(ctx.sessionService.sessionInformation).toEqual(adminSession);
    expect(TestBed.inject(Router).url).toBe('/sessions');

    // The sessions list is now loaded with the JWT added by the interceptor
    const listReq = ctx.httpMock.expectOne('api/session');
    expect(listReq.request.headers.get('Authorization')).toBe('Bearer admin-jwt');
    listReq.flush(sessions);
  });

  it('should display an error on wrong login / password', async () => {
    typeInto(root, 'input[formControlName="email"]', 'yoga@studio.com');
    typeInto(root, 'input[formControlName="password"]', 'wrong-password');
    ctx.harness.detectChanges();
    submitButton().click();

    ctx.httpMock
      .expectOne('/api/auth/login')
      .flush({ message: 'Bad credentials' }, { status: 401, statusText: 'Unauthorized' });
    await settle(ctx.harness);

    expect(root.querySelector('.error')!.textContent).toContain('An error occurred');
    expect(ctx.sessionService.isLogged).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('should keep the submit button disabled when the password is missing', () => {
    typeInto(root, 'input[formControlName="email"]', 'yoga@studio.com');
    ctx.harness.detectChanges();

    expect(submitButton().disabled).toBe(true);
    ctx.httpMock.expectNone('/api/auth/login');
  });

  it('should keep the submit button disabled when the email is missing', () => {
    typeInto(root, 'input[formControlName="password"]', 'test!1234');
    ctx.harness.detectChanges();

    expect(submitButton().disabled).toBe(true);
  });

  it('should keep the submit button disabled when the email is malformed', () => {
    typeInto(root, 'input[formControlName="email"]', 'not-an-email');
    typeInto(root, 'input[formControlName="password"]', 'test!1234');
    ctx.harness.detectChanges();

    expect(submitButton().disabled).toBe(true);
  });
});
