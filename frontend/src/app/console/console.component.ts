import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { IEvent } from '../models/Event';

@Component({
  selector: 'app-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit {
  eventData: IEvent[] = []

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Poll the API every 5 seconds
    interval(5000)
      .pipe(switchMap(() => this.getEvents()))
      .subscribe(data => this.eventData = data);
  }

  getEvents(): Observable<any> {
    return this.http.get('http://127.0.0.1:8000/status');
  }
}
