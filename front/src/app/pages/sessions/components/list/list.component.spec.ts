import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { Session } from 'src/app/core/models/session.interface';
import { SessionApiService } from 'src/app/core/service/session-api.service';
import { SessionService } from 'src/app/core/service/session.service';

import { ListComponent } from './list.component';

describe('ListComponent (unit)', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  const sessions: Session[] = [
    { id: 1, name: 'Yoga matin', description: 'Réveil en douceur', date: new Date('2026-10-01'), teacher_id: 1, users: [] },
    { id: 2, name: 'Yoga soir', description: 'Détente', date: new Date('2026-10-02'), teacher_id: 2, users: [1] },
  ];
  const sessionApiServiceMock = { all: jest.fn(() => of(sessions)) };

  const setup = async (admin: boolean): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: { sessionInformation: { admin, id: 1 } } },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const buttonsWithText = (text: string): HTMLElement[] =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('button'))
      .filter((b) => b.textContent!.includes(text));

  it('should create and expose the logged user', async () => {
    await setup(true);

    expect(component).toBeTruthy();
    expect(component.user).toEqual({ admin: true, id: 1 });
  });

  it('should display the list of sessions', async () => {
    await setup(false);

    const items = fixture.nativeElement.querySelectorAll('.item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Yoga matin');
    expect(items[0].textContent).toContain('Réveil en douceur');
    expect(items[1].textContent).toContain('Yoga soir');
    expect(buttonsWithText('Detail').length).toBe(2);
  });

  it('should display Create and Edit buttons for an admin', async () => {
    await setup(true);

    expect(buttonsWithText('Create').length).toBe(1);
    expect(buttonsWithText('Edit').length).toBe(2);
  });

  it('should hide Create and Edit buttons for a non admin user', async () => {
    await setup(false);

    expect(buttonsWithText('Create').length).toBe(0);
    expect(buttonsWithText('Edit').length).toBe(0);
  });
});
