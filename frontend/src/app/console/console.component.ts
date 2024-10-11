import { Component, Inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { catchError, startWith, switchMap, filter, take } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IEvent } from '../models/Event';

const EVENT_KEY = makeStateKey<IEvent[]>('eventData');

@Component({
  selector: 'app-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit {
  eventData = signal<IEvent[]>([]);

  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
    private appRef: ApplicationRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Wait for the application to become stable before starting the polling
      this.appRef.isStable
        .pipe(
          filter(stable => stable), // Ensure the app is stable
          take(1) // Take the first stable state and start polling
        )
        .subscribe(() => {
          // Now start the polling after the app is stable
          interval(5000)
            .pipe(
              startWith(this.eventData()),
              switchMap(() => this.getEvents()),
              catchError(() => {
                console.error('Error fetching events');
                return of([]);
              })
            )
            .subscribe(data => {
              console.log('New event data:', data);
              this.eventData.set(data);
            });
        });
    } else {
      // On the server-side, attempt to fetch data only once
      this.eventData.set(this.transferState.get(EVENT_KEY, []));
      this.getEvents().subscribe(data => {
        this.eventData.set(data);
        this.transferState.set(EVENT_KEY, data);
      });
    }
  }

  getEvents(): Observable<IEvent[]> {
    return this.http.get<IEvent[]>('http://127.0.0.1:8000/events').pipe(
      catchError(() => {
        console.error('Error retrieving events')
        return of([]);
      })
    );
  }

  trackByEventId(index: number, event: IEvent): number {
    return event.id;
  }  
}
