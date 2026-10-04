import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Teacher } from '../models/teacher.interface';

import { TeacherService } from './teacher.service';

describe('TeacherService (unit)', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const teacher: Teacher = {
    id: 1,
    firstName: 'Margot',
    lastName: 'Delahaye',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all teachers', () => {
    let result: Teacher[] | undefined;
    service.all().subscribe((teachers) => (result = teachers));

    const req = httpMock.expectOne('api/teacher');
    expect(req.request.method).toBe('GET');
    req.flush([teacher]);

    expect(result).toEqual([teacher]);
  });

  it('should fetch the detail of a teacher', () => {
    let result: Teacher | undefined;
    service.detail('1').subscribe((t) => (result = t));

    const req = httpMock.expectOne('api/teacher/1');
    expect(req.request.method).toBe('GET');
    req.flush(teacher);

    expect(result).toEqual(teacher);
  });
});
