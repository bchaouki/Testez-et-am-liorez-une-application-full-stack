import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import {
  adminSession,
  buttonWithText,
  IntegrationContext,
  settle,
  setupIntegration,
  user,
  userSession,
} from 'src/testing/integration.helpers';

import { MeComponent } from './me.component';

describe('Account (integration)', () => {
  let ctx: IntegrationContext;

  beforeEach(async () => {
    ctx = await setupIntegration();
    jest.spyOn(MatSnackBar.prototype, 'open');
  });

  afterEach(() => {
    ctx.httpMock.verify();
    jest.restoreAllMocks();
  });

  it('should display the user information', async () => {
    ctx.sessionService.logIn(userSession);
    await ctx.harness.navigateByUrl('/me', MeComponent);
    const req = ctx.httpMock.expectOne('api/user/2');
    expect(req.request.headers.get('Authorization')).toBe('Bearer user-jwt');
    req.flush(user);
    ctx.harness.detectChanges();

    const text = ctx.harness.routeNativeElement!.textContent!;
    expect(text).toContain('User information');
    expect(text).toContain('Name: John DOE');
    expect(text).toContain('Email: john@doe.com');
    expect(text).toContain('Create at:  January 1, 2026');
    expect(text).toContain('Last update:  February 1, 2026');
    expect(text).toContain('Delete my account');
  });

  it('should tell an admin that they are admin', async () => {
    ctx.sessionService.logIn(adminSession);
    await ctx.harness.navigateByUrl('/me', MeComponent);
    ctx.httpMock.expectOne('api/user/1').flush({ ...user, id: 1, admin: true });
    ctx.harness.detectChanges();

    const text = ctx.harness.routeNativeElement!.textContent!;
    expect(text).toContain('You are admin');
    expect(text).not.toContain('Delete my account');
  });

  it('should delete the account, log the user out and go back to login', async () => {
    ctx.sessionService.logIn(userSession);
    await ctx.harness.navigateByUrl('/me', MeComponent);
    ctx.httpMock.expectOne('api/user/2').flush(user);
    ctx.harness.detectChanges();

    buttonWithText(ctx.harness.routeNativeElement!, 'Detail')!.click();
    const req = ctx.httpMock.expectOne('api/user/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await settle(ctx.harness);

    expect(ctx.sessionService.isLogged).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(MatSnackBar.prototype.open).toHaveBeenCalledWith('Your account has been deleted !', 'Close', { duration: 3000 });
  });

  it('should redirect to login when the user is not logged', async () => {
    await ctx.harness.navigateByUrl('/me');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
