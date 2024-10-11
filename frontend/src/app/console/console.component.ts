import { Component, Inject, makeStateKey, OnInit, PLATFORM_ID, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { catchError, startWith, switchMap, timeout } from 'rxjs/operators';
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
  eventData: IEvent[] = []

  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object // Inject platform to detect browser/server
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // On the client side, poll the API every 5 seconds
      interval(5000)
        .pipe(
          startWith(this.eventData),
          switchMap(() => this.getEvents()),
          catchError(() => {
            console.error('Error fetching events');
            return of([]);
          })
        )
        .subscribe(data => this.eventData = data);
    } else {
      // On the server-side, attempt to fetch data only once
      this.eventData = this.transferState.get(EVENT_KEY, []);
      this.getEvents().subscribe(data => {
        this.eventData = data;
        this.transferState.set(EVENT_KEY, data);
      });
    }
  }

  getEvents(): Observable<IEvent[]> {
    return this.http.get<IEvent[]>('http://127.0.0.1:8000/events').pipe(
      catchError(() => of([]))
    );
  }
}
