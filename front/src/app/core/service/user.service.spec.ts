import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { User } from '../models/user.interface';

import { UserService } from './user.service';

describe('UserService (unit)', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const user: User = {
    id: 1,
    email: 'john@doe.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    password: 'secret',
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a user by id', () => {
    let result: User | undefined;
    service.getById('1').subscribe((u) => (result = u));

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('GET');
    req.flush(user);

    expect(result).toEqual(user);
  });

  it('should delete a user', () => {
    service.delete('1').subscribe();

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
