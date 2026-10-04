import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Session } from '../models/session.interface';

import { SessionApiService } from './session-api.service';

describe('SessionApiService (unit)', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const session: Session = {
    id: 1,
    name: 'Yoga',
    description: 'Session de yoga',
    date: new Date('2026-10-01'),
    teacher_id: 1,
    users: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all sessions', () => {
    let result: Session[] | undefined;
    service.all().subscribe((sessions) => (result = sessions));

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush([session]);

    expect(result).toEqual([session]);
  });

  it('should fetch the detail of a session', () => {
    let result: Session | undefined;
    service.detail('1').subscribe((s) => (result = s));

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(session);

    expect(result).toEqual(session);
  });

  it('should delete a session', () => {
    service.delete('1').subscribe();

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should create a session', () => {
    let result: Session | undefined;
    service.create(session).subscribe((s) => (result = s));

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(session);
    req.flush(session);

    expect(result).toEqual(session);
  });

  it('should update a session', () => {
    service.update('1', session).subscribe();

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(session);
    req.flush(session);
  });

  it('should participate to a session', () => {
    service.participate('1', '2').subscribe();

    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(null);
  });

  it('should unParticipate from a session', () => {
    service.unParticipate('1', '2').subscribe();

    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
