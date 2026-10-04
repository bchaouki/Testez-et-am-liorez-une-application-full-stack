import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';

import { DetailComponent } from './detail.component';

describe('DetailComponent (unit)', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let snackBar: MatSnackBar;
  let router: Router;

  const session: Session = {
    id: 1,
    name: 'yoga matin',
    description: 'Réveil en douceur',
    date: new Date('2026-10-01'),
    teacher_id: 3,
    users: [2, 5],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-02-01'),
  };
  const teacher: Teacher = {
    id: 3,
    firstName: 'Margot',
    lastName: 'Delahaye',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const sessionApiServiceMock = {
    detail: jest.fn(() => of(session)),
    delete: jest.fn(() => of(undefined)),
    participate: jest.fn(() => of(undefined)),
    unParticipate: jest.fn(() => of(undefined)),
  };
  const teacherServiceMock = { detail: jest.fn(() => of(teacher)) };

  const setup = async (admin: boolean, userId: number): Promise<void> => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        { provide: SessionService, useValue: { sessionInformation: { admin, id: userId } } },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    // MatSnackBar is provided by the MaterialModule imported by the standalone component
    snackBar = fixture.debugElement.injector.get(MatSnackBar);
    jest.spyOn(snackBar, 'open').mockReturnValue({} as never);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  const text = (): string => fixture.nativeElement.textContent;

  it('should create and read ids from the route and the session', async () => {
    await setup(true, 1);

    expect(component).toBeTruthy();
    expect(component.sessionId).toBe('1');
    expect(component.userId).toBe('1');
    expect(component.isAdmin).toBe(true);
  });

  it('should fetch the session and its teacher', async () => {
    await setup(false, 2);

    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');
    expect(teacherServiceMock.detail).toHaveBeenCalledWith('3');
    expect(component.session).toEqual(session);
    expect(component.teacher).toEqual(teacher);
    expect(component.isParticipate).toBe(true);
  });

  it('should display the session information', async () => {
    await setup(false, 9);

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Yoga Matin');
    expect(text()).toContain('Margot DELAHAYE');
    expect(text()).toContain('2 attendees');
    expect(text()).toContain('Réveil en douceur');
    expect(text()).toContain('October 1, 2026');
    expect(component.isParticipate).toBe(false);
  });

  it('should display the Delete button for an admin', async () => {
    await setup(true, 1);

    expect(text()).toContain('Delete');
    expect(text()).not.toContain('Participate');
  });

  it('should not display the Delete button for a non admin user', async () => {
    await setup(false, 9);

    expect(text()).not.toContain('Delete');
    expect(text()).toContain('Participate');
  });

  it('should display the "Do not participate" button when the user participates', async () => {
    await setup(false, 2);

    expect(text()).toContain('Do not participate');
  });

  it('should delete the session, notify and navigate to sessions', async () => {
    await setup(true, 1);

    component.delete();

    expect(sessionApiServiceMock.delete).toHaveBeenCalledWith('1');
    expect(snackBar.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should participate and refresh the session', async () => {
    await setup(false, 9);

    component.participate();

    expect(sessionApiServiceMock.participate).toHaveBeenCalledWith('1', '9');
    expect(sessionApiServiceMock.detail).toHaveBeenCalledTimes(2);
  });

  it('should unParticipate and refresh the session', async () => {
    await setup(false, 2);

    component.unParticipate();

    expect(sessionApiServiceMock.unParticipate).toHaveBeenCalledWith('1', '2');
    expect(sessionApiServiceMock.detail).toHaveBeenCalledTimes(2);
  });

  it('should go back in history', async () => {
    await setup(true, 1);
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);

    component.back();

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
