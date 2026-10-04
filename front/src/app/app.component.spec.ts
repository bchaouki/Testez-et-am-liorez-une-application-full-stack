import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { BehaviorSubject } from 'rxjs';
import { SessionService } from './core/service/session.service';

import { AppComponent } from './app.component';

describe('AppComponent (unit)', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  const isLogged$ = new BehaviorSubject<boolean>(false);
  const sessionServiceMock = {
    $isLogged: jest.fn(() => isLogged$.asObservable()),
    logOut: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    isLogged$.next(false);
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  const text = (): string => fixture.nativeElement.textContent;

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should display Login and Register links when logged out', () => {
    expect(text()).toContain('Login');
    expect(text()).toContain('Register');
    expect(text()).not.toContain('Logout');
  });

  it('should display Sessions, Account and Logout links when logged in', () => {
    isLogged$.next(true);
    fixture.detectChanges();

    expect(text()).toContain('Sessions');
    expect(text()).toContain('Account');
    expect(text()).toContain('Logout');
    expect(text()).not.toContain('Register');
  });

  it('should log out and navigate home', () => {
    component.logout();

    expect(sessionServiceMock.logOut).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['']);
  });
});
