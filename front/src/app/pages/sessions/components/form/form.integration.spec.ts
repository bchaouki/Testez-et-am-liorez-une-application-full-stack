import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import {
  adminSession,
  IntegrationContext,
  sessions,
  settle,
  setupIntegration,
  teachers,
  typeInto,
  userSession,
} from 'src/testing/integration.helpers';

import { FormComponent } from './form.component';

describe('Session form (integration)', () => {
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

  const saveButton = (): HTMLButtonElement => root.querySelector('button[type="submit"]')!;

  const selectTeacher = async (label: string): Promise<void> => {
    root.querySelector<HTMLElement>('.mat-mdc-select-trigger')!.click();
    await settle(ctx.harness);
    const option = Array.from(document.querySelectorAll<HTMLElement>('mat-option'))
      .find((o) => o.textContent!.includes(label))!;
    option.click();
    await settle(ctx.harness);
  };

  describe('creation', () => {
    beforeEach(async () => {
      ctx.sessionService.logIn(adminSession);
      await ctx.harness.navigateByUrl('/sessions/create', FormComponent);
      ctx.httpMock.expectOne('api/teacher').flush(teachers);
      ctx.harness.detectChanges();
      root = ctx.harness.routeNativeElement!;
    });

    it('should display an empty creation form', () => {
      expect(root.querySelector('h1')!.textContent).toContain('Create session');
      expect(saveButton().disabled).toBe(true);
    });

    it('should create the session and go back to the list', async () => {
      typeInto(root, 'input[formControlName="name"]', 'Yoga du midi');
      typeInto(root, 'input[formControlName="date"]', '2026-11-15');
      typeInto(root, 'textarea[formControlName="description"]', 'Pause déjeuner zen');
      await selectTeacher('Hélène');

      expect(saveButton().disabled).toBe(false);
      saveButton().click();

      const req = ctx.httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: 'Yoga du midi',
        date: new Date('2026-11-15'),
        teacher_id: 2,
        description: 'Pause déjeuner zen',
        users: [],
      });
      req.flush({ ...req.request.body, id: 3 });
      await settle(ctx.harness);

      expect(TestBed.inject(Router).url).toBe('/sessions');
      expect(MatSnackBar.prototype.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      ctx.httpMock.expectOne('api/session').flush(sessions);
    });

    it('should keep Save disabled when the description is missing', async () => {
      typeInto(root, 'input[formControlName="name"]', 'Yoga du midi');
      typeInto(root, 'input[formControlName="date"]', '2026-11-15');
      await selectTeacher('Margot');

      expect(saveButton().disabled).toBe(true);
    });

    it('should keep Save disabled when the teacher is missing', () => {
      typeInto(root, 'input[formControlName="name"]', 'Yoga du midi');
      typeInto(root, 'input[formControlName="date"]', '2026-11-15');
      typeInto(root, 'textarea[formControlName="description"]', 'Pause déjeuner zen');
      ctx.harness.detectChanges();

      expect(saveButton().disabled).toBe(true);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      ctx.sessionService.logIn(adminSession);
      await ctx.harness.navigateByUrl('/sessions/update/1', FormComponent);
      ctx.httpMock.expectOne('api/session/1').flush(sessions[0]);
      ctx.harness.detectChanges();
      // teachers are requested once the form (and its select) is rendered
      ctx.httpMock.expectOne('api/teacher').flush(teachers);
      ctx.harness.detectChanges();
      root = ctx.harness.routeNativeElement!;
    });

    it('should prefill the form with the session', () => {
      expect(root.querySelector('h1')!.textContent).toContain('Update session');
      expect(root.querySelector<HTMLInputElement>('input[formControlName="name"]')!.value).toBe('yoga matin');
      expect(root.querySelector<HTMLInputElement>('input[formControlName="date"]')!.value).toBe('2026-10-01');
      expect(root.querySelector<HTMLTextAreaElement>('textarea[formControlName="description"]')!.value)
        .toBe('Réveil en douceur');
      expect(saveButton().disabled).toBe(false);
    });

    it('should update the session and go back to the list', async () => {
      typeInto(root, 'input[formControlName="name"]', 'Yoga du matin (modifié)');
      ctx.harness.detectChanges();
      saveButton().click();

      const req = ctx.httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expect.objectContaining({
        name: 'Yoga du matin (modifié)',
        teacher_id: 1,
        description: 'Réveil en douceur',
      }));
      req.flush({ ...sessions[0], name: 'Yoga du matin (modifié)' });
      await settle(ctx.harness);

      expect(TestBed.inject(Router).url).toBe('/sessions');
      expect(MatSnackBar.prototype.open).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      ctx.httpMock.expectOne('api/session').flush(sessions);
    });

    it('should disable Save when a required field is emptied', () => {
      typeInto(root, 'input[formControlName="name"]', '');
      ctx.harness.detectChanges();

      expect(saveButton().disabled).toBe(true);
    });
  });

  it('should redirect a regular user to the sessions list', async () => {
    ctx.sessionService.logIn(userSession);
    await ctx.harness.navigateByUrl('/sessions/create');
    await settle(ctx.harness);

    expect(TestBed.inject(Router).url).toBe('/sessions');
    // the teachers request was cancelled when leaving the form
    ctx.httpMock.match('api/teacher');
    ctx.httpMock.expectOne('api/session').flush(sessions);
  });
});
