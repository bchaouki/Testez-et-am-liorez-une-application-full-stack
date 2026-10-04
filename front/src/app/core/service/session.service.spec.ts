import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from '../models/sessionInformation.interface';

import { SessionService } from './session.service';

describe('SessionService (unit)', () => {
  let service: SessionService;

  const sessionInformation: SessionInformation = {
    token: 'token',
    type: 'Bearer',
    id: 1,
    username: 'yoga@studio.com',
    firstName: 'Admin',
    lastName: 'Admin',
    admin: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created and logged out by default', () => {
    expect(service).toBeTruthy();
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  it('should emit false initially through $isLogged', () => {
    const values: boolean[] = [];
    service.$isLogged().subscribe((v) => values.push(v));

    expect(values).toEqual([false]);
  });

  it('should log in a user and emit true', () => {
    const values: boolean[] = [];
    service.$isLogged().subscribe((v) => values.push(v));

    service.logIn(sessionInformation);

    expect(service.isLogged).toBe(true);
    expect(service.sessionInformation).toEqual(sessionInformation);
    expect(values).toEqual([false, true]);
  });

  it('should log out a user and emit false', () => {
    service.logIn(sessionInformation);
    const values: boolean[] = [];
    service.$isLogged().subscribe((v) => values.push(v));

    service.logOut();

    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
    expect(values).toEqual([true, false]);
  });
});
