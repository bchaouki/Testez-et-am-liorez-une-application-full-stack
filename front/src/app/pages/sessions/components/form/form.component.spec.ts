import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { Session } from 'src/app/core/models/session.interface';
import { SessionService } from 'src/app/core/service/session.service';
import { TeacherService } from 'src/app/core/service/teacher.service';
import { SessionApiService } from '../../../../core/service/session-api.service';

import { FormComponent } from './form.component';

describe('FormComponent (unit)', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let snackBar: MatSnackBar;
  let router: Router;

  const session: Session = {
    id: 1,
    name: 'Yoga matin',
    description: 'Réveil en douceur',
    date: new Date('2026-10-01'),
    teacher_id: 3,
    users: [],
  };
  const sessionApiServiceMock = {
    detail: jest.fn(() => of(session)),
    create: jest.fn(() => of(session)),
    update: jest.fn(() => of(session)),
  };
  const teacherServiceMock = { all: jest.fn(() => of([])) };

  const setup = async (admin: boolean, url: string): Promise<void> => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        { provide: SessionService, useValue: { sessionInformation: { admin, id: 1 } } },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'url', 'get').mockReturnValue(url);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    // MatSnackBar is provided by the MaterialModule imported by the standalone component
    snackBar = fixture.debugElement.injector.get(MatSnackBar);
    jest.spyOn(snackBar, 'open').mockReturnValue({} as never);
    fixture.detectChanges();
  };

  const saveButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button[type="submit"]');

  describe('create mode', () => {
    beforeEach(async () => setup(true, '/sessions/create'));

    it('should create an empty form', () => {
      expect(component).toBeTruthy();
      expect(component.onUpdate).toBe(false);
      expect(component.sessionForm!.getRawValue()).toEqual({
        name: '',
        date: '',
        teacher_id: null,
        description: '',
      });
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Create session');
      expect(sessionApiServiceMock.detail).not.toHaveBeenCalled();
    });

    it('should keep the Save button disabled when required fields are missing', () => {
      expect(component.sessionForm!.invalid).toBe(true);
      expect(saveButton().disabled).toBe(true);

      component.sessionForm!.setValue({ name: 'Yoga', date: '2026-10-01', teacher_id: 3, description: '' });
      fixture.detectChanges();

      expect(component.sessionForm!.controls.description.hasError('required')).toBe(true);
      expect(saveButton().disabled).toBe(true);
    });

    it('should create the session, notify and navigate', () => {
      component.sessionForm!.setValue({ name: 'Yoga', date: '2026-10-01', teacher_id: 3, description: 'Desc' });
      fixture.detectChanges();
      expect(saveButton().disabled).toBe(false);

      component.submit();

      expect(sessionApiServiceMock.create).toHaveBeenCalledWith({
        name: 'Yoga',
        date: new Date('2026-10-01'),
        teacher_id: 3,
        description: 'Desc',
        users: [],
      });
      expect(snackBar.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('should do nothing on submit when the form is not initialized', () => {
      component.sessionForm = undefined;

      component.submit();

      expect(sessionApiServiceMock.create).not.toHaveBeenCalled();
      expect(sessionApiServiceMock.update).not.toHaveBeenCalled();
    });
  });

  describe('update mode', () => {
    beforeEach(async () => setup(true, '/sessions/update/1'));

    it('should fetch the session and prefill the form', () => {
      expect(component.onUpdate).toBe(true);
      expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');
      expect(component.sessionForm!.getRawValue()).toEqual({
        name: 'Yoga matin',
        date: '2026-10-01',
        teacher_id: 3,
        description: 'Réveil en douceur',
      });
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Update session');
    });

    it('should update the session, notify and navigate', () => {
      component.sessionForm!.controls.name.setValue('Yoga modifié');

      component.submit();

      expect(sessionApiServiceMock.update).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Yoga modifié' }));
      expect(snackBar.open).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('should disable Save when a required field is cleared', () => {
      component.sessionForm!.controls.name.setValue('');
      fixture.detectChanges();

      expect(saveButton().disabled).toBe(true);
    });
  });

  it('should redirect a non admin user to sessions', async () => {
    await setup(false, '/sessions/create');

    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });
});
