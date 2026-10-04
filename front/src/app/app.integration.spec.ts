import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { integrationProviders, sessions, user, userSession } from 'src/testing/integration.helpers';
import { appConfig } from './app.config';
import { SessionService } from './core/service/session.service';

import { AppComponent } from './app.component';

describe('App navigation & logout (integration)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: integrationProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    await router.navigateByUrl('/');
    await settle();
  });

  afterEach(() => httpMock.verify());

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const link = (label: string): HTMLElement =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.link'))
      .find((l) => l.textContent!.trim() === label)!;

  it('should expose an application config with providers', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should redirect the root url to the login page when logged out', () => {
    expect(router.url).toBe('/login');
    expect(link('Login')).toBeDefined();
    expect(link('Register')).toBeDefined();
    expect(link('Logout')).toBeUndefined();
  });

  it('should navigate to the register page from the toolbar', async () => {
    link('Register').click();
    await settle();

    expect(router.url).toBe('/register');
  });

  it('should show the logged-in menu and navigate to Account and Sessions', async () => {
    sessionService.logIn(userSession);
    await settle();

    expect(link('Login')).toBeUndefined();
    link('Account').click();
    await settle();
    expect(router.url).toBe('/me');
    httpMock.expectOne('api/user/2').flush(user);

    link('Sessions').click();
    await settle();
    expect(router.url).toBe('/sessions');
    httpMock.expectOne('api/session').flush(sessions);
  });

  it('should log the user out and go back to the login page', async () => {
    sessionService.logIn(userSession);
    await router.navigateByUrl('/sessions');
    await settle();
    httpMock.expectOne('api/session').flush(sessions);

    link('Logout').click();
    await settle();

    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();
    expect(router.url).toBe('/login');
    expect(link('Login')).toBeDefined();
    expect(link('Logout')).toBeUndefined();
  });

  it('should display the not found page for an unknown url', async () => {
    await router.navigateByUrl('/unknown/page');
    await settle();

    expect(router.url).toBe('/404');
    expect(fixture.nativeElement.textContent).toContain('Page not found !');
  });
});
