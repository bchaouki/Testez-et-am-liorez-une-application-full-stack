import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { LoginRequest } from '../models/loginRequest.interface';
import { RegisterRequest } from '../models/registerRequest.interface';
import { SessionInformation } from '../models/sessionInformation.interface';

import { AuthService } from './auth.service';

describe('AuthService (unit)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    const registerRequest: RegisterRequest = {
      email: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'secret',
    };

    service.register(registerRequest).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);
    req.flush(null);
  });

  it('should log a user in', () => {
    const loginRequest: LoginRequest = { email: 'john@doe.com', password: 'secret' };
    const sessionInformation: SessionInformation = {
      token: 'token',
      type: 'Bearer',
      id: 1,
      username: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: false,
    };
    let result: SessionInformation | undefined;

    service.login(loginRequest).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginRequest);
    req.flush(sessionInformation);

    expect(result).toEqual(sessionInformation);
  });
});
