import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionService } from '../core/service/session.service';
import { UserService } from '../core/service/user.service';

import { customJwtInterceptorFn } from './customJwtInterceptorFn';

describe('customJwtInterceptorFn (integration)', () => {
  let userService: UserService;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([customJwtInterceptorFn])),
        provideHttpClientTesting(),
      ],
    });
    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should not add an Authorization header when the user is not logged', () => {
    userService.getById('1').subscribe();

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should add the Bearer token when the user is logged', () => {
    sessionService.logIn({
      token: 'my-jwt',
      type: 'Bearer',
      id: 1,
      username: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: false,
    });

    userService.getById('1').subscribe();

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt');
    req.flush({});
  });
});
