import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app/app.routes';
import { Session } from '../app/core/models/session.interface';
import { SessionInformation } from '../app/core/models/sessionInformation.interface';
import { Teacher } from '../app/core/models/teacher.interface';
import { User } from '../app/core/models/user.interface';
import { SessionService } from '../app/core/service/session.service';
import { customJwtInterceptorFn } from '../app/interceptors/customJwtInterceptorFn';

/**
 * Integration tests use the real application wiring (routes, guards, services,
 * JWT interceptor). Only the back-end is replaced by HttpTestingController.
 */
export const integrationProviders: (Provider | EnvironmentProviders)[] = [
  provideRouter(routes),
  provideHttpClient(withInterceptors([customJwtInterceptorFn])),
  provideHttpClientTesting(),
  provideNoopAnimations(),
];

export interface IntegrationContext {
  harness: RouterTestingHarness;
  httpMock: HttpTestingController;
  sessionService: SessionService;
}

export const setupIntegration = async (): Promise<IntegrationContext> => {
  TestBed.configureTestingModule({ providers: integrationProviders });
  return {
    harness: await RouterTestingHarness.create(),
    httpMock: TestBed.inject(HttpTestingController),
    sessionService: TestBed.inject(SessionService),
  };
};

/** Lets pending navigations/async work finish, then refreshes the view. */
export const settle = async (harness: RouterTestingHarness): Promise<void> => {
  await harness.fixture.whenStable();
  harness.detectChanges();
};

export const typeInto = (root: HTMLElement, selector: string, value: string): void => {
  const input = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

export const buttonWithText = (root: HTMLElement, label: string): HTMLButtonElement | undefined =>
  Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent!.includes(label));

export const adminSession: SessionInformation = {
  token: 'admin-jwt',
  type: 'Bearer',
  id: 1,
  username: 'yoga@studio.com',
  firstName: 'Admin',
  lastName: 'Admin',
  admin: true,
};

export const userSession: SessionInformation = {
  token: 'user-jwt',
  type: 'Bearer',
  id: 2,
  username: 'john@doe.com',
  firstName: 'John',
  lastName: 'Doe',
  admin: false,
};

export const teachers: Teacher[] = [
  { id: 1, firstName: 'Margot', lastName: 'Delahaye', createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01') },
  { id: 2, firstName: 'Hélène', lastName: 'Thiercelin', createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01') },
];

export const sessions: Session[] = [
  {
    id: 1,
    name: 'yoga matin',
    description: 'Réveil en douceur',
    date: new Date('2026-10-01'),
    teacher_id: 1,
    users: [3],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 2,
    name: 'yoga soir',
    description: 'Détente avant de dormir',
    date: new Date('2026-10-02'),
    teacher_id: 2,
    users: [],
  },
];

export const user: User = {
  id: 2,
  email: 'john@doe.com',
  firstName: 'John',
  lastName: 'Doe',
  admin: false,
  password: '',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-02-01'),
};
