import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { User } from 'src/app/core/models/user.interface';
import { SessionService } from 'src/app/core/service/session.service';
import { UserService } from 'src/app/core/service/user.service';

import { MeComponent } from './me.component';

describe('MeComponent (unit)', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let snackBar: MatSnackBar;
  let router: Router;

  const baseUser: User = {
    id: 1,
    email: 'john@doe.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    password: 'secret',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-02-01'),
  };
  const userServiceMock = { getById: jest.fn(), delete: jest.fn(() => of(undefined)) };
  const sessionServiceMock = { sessionInformation: { admin: false, id: 1 }, logOut: jest.fn() };

  const setup = async (user: User): Promise<void> => {
    jest.clearAllMocks();
    userServiceMock.getById.mockReturnValue(of(user));
    await TestBed.configureTestingModule({
      imports: [MeComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: UserService, useValue: userServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    // MatSnackBar is provided by the MaterialModule imported by the standalone component
    snackBar = fixture.debugElement.injector.get(MatSnackBar);
    jest.spyOn(snackBar, 'open').mockReturnValue({} as never);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  const text = (): string => fixture.nativeElement.textContent;

  it('should fetch and display the user information', async () => {
    await setup(baseUser);

    expect(userServiceMock.getById).toHaveBeenCalledWith('1');
    expect(component.user).toEqual(baseUser);
    expect(text()).toContain('Name: John DOE');
    expect(text()).toContain('Email: john@doe.com');
    expect(text()).toContain('January 1, 2026');
    expect(text()).toContain('Delete my account');
    expect(text()).not.toContain('You are admin');
  });

  it('should display the admin mention for an admin user', async () => {
    await setup({ ...baseUser, admin: true });

    expect(text()).toContain('You are admin');
    expect(text()).not.toContain('Delete my account');
  });

  it('should delete the account, log out and navigate home', async () => {
    await setup(baseUser);

    component.delete();

    expect(userServiceMock.delete).toHaveBeenCalledWith('1');
    expect(snackBar.open).toHaveBeenCalledWith('Your account has been deleted !', 'Close', { duration: 3000 });
    expect(sessionServiceMock.logOut).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should go back in history', async () => {
    await setup(baseUser);
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);

    component.back();

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
