import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { SessionService } from '../core/service/session.service';

import { AuthGuard } from './auth.guard';

describe('AuthGuard (unit)', () => {
  let guard: AuthGuard;
  const sessionServiceMock = { isLogged: false };
  const routerMock = { navigate: jest.fn() };

  beforeEach(() => {
    routerMock.navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should allow activation when the user is logged', () => {
    sessionServiceMock.isLogged = true;

    expect(guard.canActivate()).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when the user is not logged', () => {
    sessionServiceMock.isLogged = false;

    expect(guard.canActivate()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
  });
});
