import { TestBed } from '@angular/core/testing';
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

import { ListComponent } from './list.component';

describe('Sessions list (integration)', () => {
  let ctx: IntegrationContext;

  beforeEach(async () => {
    ctx = await setupIntegration();
  });

  afterEach(() => ctx.httpMock.verify());

  const openList = async (): Promise<HTMLElement> => {
    await ctx.harness.navigateByUrl('/sessions', ListComponent);
    ctx.httpMock.expectOne('api/session').flush(sessions);
    ctx.harness.detectChanges();
    return ctx.harness.routeNativeElement!;
  };

  it('should display the list of sessions', async () => {
    ctx.sessionService.logIn(userSession);
    const root = await openList();

    const items = root.querySelectorAll('.item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('yoga matin');
    expect(items[0].textContent).toContain('Session on October 1, 2026');
    expect(items[0].textContent).toContain('Réveil en douceur');
    expect(items[1].textContent).toContain('yoga soir');
  });

  it('should display the Create and Edit buttons for an admin', async () => {
    ctx.sessionService.logIn(adminSession);
    const root = await openList();

    expect(buttonWithText(root, 'Create')).toBeDefined();
    expect(root.querySelectorAll('.item button').length).toBe(4); // Detail + Edit per session
  });

  it('should not display the Create and Edit buttons for a regular user', async () => {
    ctx.sessionService.logIn(userSession);
    const root = await openList();

    expect(buttonWithText(root, 'Create')).toBeUndefined();
    expect(buttonWithText(root, 'Edit')).toBeUndefined();
    expect(root.querySelectorAll('.item button').length).toBe(2); // Detail only
  });

  it('should open the session detail when clicking on Detail', async () => {
    ctx.sessionService.logIn(userSession);
    const root = await openList();

    buttonWithText(root, 'Detail')!.click();
    await settle(ctx.harness);

    expect(TestBed.inject(Router).url).toBe('/sessions/detail/1');
    ctx.httpMock.expectOne('api/session/1').flush(sessions[0]);
    ctx.httpMock.expectOne('api/teacher/1').flush(teachers[0]);
  });

  it('should open the creation form when an admin clicks on Create', async () => {
    ctx.sessionService.logIn(adminSession);
    const root = await openList();

    buttonWithText(root, 'Create')!.click();
    await settle(ctx.harness);

    expect(TestBed.inject(Router).url).toBe('/sessions/create');
    ctx.httpMock.expectOne('api/teacher').flush(teachers);
  });

  it('should redirect to login when the user is not logged', async () => {
    await ctx.harness.navigateByUrl('/sessions');

    expect(TestBed.inject(Router).url).toBe('/login');
    ctx.httpMock.expectNone('api/session');
  });
});
