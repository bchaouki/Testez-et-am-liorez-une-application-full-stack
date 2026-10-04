import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import {
  adminSession,
  buttonWithText,
  IntegrationContext,
  sessions,
  settle,
  setupIntegration,
  teachers,
  userSession,
} from 'src/testing/integration.helpers';

import { DetailComponent } from './detail.component';

describe('Session information (integration)', () => {
  let ctx: IntegrationContext;
  let root: HTMLElement;

  beforeEach(async () => {
    ctx = await setupIntegration();
    jest.spyOn(MatSnackBar.prototype, 'open');
  });

  afterEach(() => {
    ctx.httpMock.verify();
    jest.restoreAllMocks();
  });

  const openDetail = async (session = sessions[0]): Promise<void> => {
    await ctx.harness.navigateByUrl('/sessions/detail/1', DetailComponent);
    ctx.httpMock.expectOne('api/session/1').flush(session);
    ctx.httpMock.expectOne('api/teacher/1').flush(teachers[0]);
    ctx.harness.detectChanges();
    root = ctx.harness.routeNativeElement!;
  };

  it('should display the session information', async () => {
    ctx.sessionService.logIn(userSession);
    await openDetail();

    const text = root.textContent!;
    expect(root.querySelector('h1')!.textContent).toContain('Yoga Matin');
    expect(text).toContain('Margot DELAHAYE');
    expect(text).toContain('1 attendees');
    expect(text).toContain('October 1, 2026');
    expect(text).toContain('Réveil en douceur');
    expect(root.querySelector('.created')!.textContent).toContain('January 1, 2026');
    expect(root.querySelector('.updated')!.textContent).toContain('February 1, 2026');
  });

  it('should display the Delete button for an admin', async () => {
    ctx.sessionService.logIn(adminSession);
    await openDetail();

    expect(buttonWithText(root, 'Delete')).toBeDefined();
    expect(buttonWithText(root, 'Participate')).toBeUndefined();
  });

  it('should not display the Delete button for a regular user', async () => {
    ctx.sessionService.logIn(userSession);
    await openDetail();

    expect(buttonWithText(root, 'Delete')).toBeUndefined();
    expect(buttonWithText(root, 'Participate')).toBeDefined();
  });

  it('should delete the session and go back to the list', async () => {
    ctx.sessionService.logIn(adminSession);
    await openDetail();

    buttonWithText(root, 'Delete')!.click();
    const req = ctx.httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer admin-jwt');
    req.flush(null);
    await settle(ctx.harness);

    expect(TestBed.inject(Router).url).toBe('/sessions');
    expect(MatSnackBar.prototype.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    ctx.httpMock.expectOne('api/session').flush([sessions[1]]);
  });

  it('should let a user participate then cancel the participation', async () => {
    ctx.sessionService.logIn(userSession);
    await openDetail();

    buttonWithText(root, 'Participate')!.click();
    const participateReq = ctx.httpMock.expectOne('api/session/1/participate/2');
    expect(participateReq.request.method).toBe('POST');
    participateReq.flush(null);
    ctx.httpMock.expectOne('api/session/1').flush({ ...sessions[0], users: [3, 2] });
    ctx.httpMock.expectOne('api/teacher/1').flush(teachers[0]);
    ctx.harness.detectChanges();

    expect(root.textContent).toContain('2 attendees');
    expect(buttonWithText(root, 'Do not participate')).toBeDefined();

    buttonWithText(root, 'Do not participate')!.click();
    const unParticipateReq = ctx.httpMock.expectOne('api/session/1/participate/2');
    expect(unParticipateReq.request.method).toBe('DELETE');
    unParticipateReq.flush(null);
    ctx.httpMock.expectOne('api/session/1').flush(sessions[0]);
    ctx.httpMock.expectOne('api/teacher/1').flush(teachers[0]);
    ctx.harness.detectChanges();

    expect(root.textContent).toContain('1 attendees');
    expect(buttonWithText(root, 'Do not participate')).toBeUndefined();
  });
});
