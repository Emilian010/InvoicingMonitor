import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, switchMap, shareReplay } from 'rxjs';
import { BillingDashboard } from '../models/billing-dashboard.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BillingMonitorService {
  private readonly apiUrl = environment.apiUrl;
  private readonly POLLING_INTERVAL_MS = 120_000; // 2 minutes

  constructor(private http: HttpClient) { }

  getDashboard(): Observable<BillingDashboard> {


    const hed = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://emx-xmlengine-fa-q.azurewebsites.net, https://kind-bush-070c5c60f.1.azurestaticapps.net',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    };
    return this.http.get<BillingDashboard>(`${this.apiUrl}/BillingMonitor/dashboard`, hed);
  }

  getDashboardByDate(fecha: string): Observable<BillingDashboard> {
    return this.http.get<BillingDashboard>(`${this.apiUrl}/BillingMonitor/dashboard/by-date`, {
      params: { fecha },
    });
  }

  getDashboardPolling(): Observable<BillingDashboard> {
    return timer(0, this.POLLING_INTERVAL_MS).pipe(
      switchMap(() => this.getDashboard()),
      shareReplay(1)
    );
  }
}
