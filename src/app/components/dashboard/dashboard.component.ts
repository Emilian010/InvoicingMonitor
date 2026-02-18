import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BillingMonitorService } from '../../services/billing-monitor.service';
import { BillingDashboard } from '../../models/billing-dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboard: BillingDashboard | null = null;
  loading = true;
  error: string | null = null;
  lastUpdated: Date | null = null;
  countdown = 120;
  selectedDate = '';
  readonly maxSelectableDate = this.getTodayDateString();
  isLiveMode = true;

  private subscription: Subscription | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private billingService: BillingMonitorService) {}

  ngOnInit(): void {
    this.startLiveMode();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.stopCurrentSubscription();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  searchByDate(): void {
    if (!this.selectedDate) {
      this.error = 'Selecciona una fecha para buscar.';
      return;
    }
    if (this.selectedDate > this.maxSelectableDate) {
      this.error = 'No es posible consultar una fecha futura.';
      return;
    }

    this.stopCurrentSubscription();
    this.isLiveMode = false;
    this.loading = true;
    this.error = null;
    this.countdown = 0;

    this.subscription = this.billingService.getDashboardByDate(this.selectedDate).subscribe({
      next: (data) => {
        this.dashboard = this.normalizeDashboard(data);
        this.loading = false;
        this.error = null;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        this.error = 'Error al obtener datos del servidor';
        this.loading = false;
        console.error('Dashboard by date error:', err);
      },
    });
  }

  clearDateFilter(): void {
    this.selectedDate = '';
    this.startLiveMode();
  }

  private startLiveMode(): void {
    this.stopCurrentSubscription();
    this.isLiveMode = true;
    this.loading = true;
    this.error = null;
    this.countdown = 120;

    this.subscription = this.billingService.getDashboardPolling().subscribe({
      next: (data) => {
        this.dashboard = this.normalizeDashboard(data);
        this.loading = false;
        this.error = null;
        this.lastUpdated = new Date();
        this.countdown = 120;
      },
      error: (err) => {
        this.error = 'Error al obtener datos del servidor';
        this.loading = false;
        console.error('Dashboard polling error:', err);
      },
    });
  }

  private stopCurrentSubscription(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (!this.isLiveMode) {
        return;
      }

      if (this.countdown > 0) {
        this.countdown--;
      }
    }, 1000);
  }

  getSuccessPercentage(): number {
    if (!this.dashboard || this.dashboard.totalProcessed === 0) return 0;
    return this.dashboard.successRate;
  }

  getErrorPercentage(): number {
    if (!this.dashboard || this.dashboard.totalProcessed === 0) return 0;
    return 100 - this.dashboard.successRate;
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  truncateMessage(msg: string | null, maxLen: number = 80): string {
    if (!msg) return '-';
    return msg.length > maxLen ? msg.substring(0, maxLen) + '...' : msg;
  }

  getSeriesBarHeight(point: { success: number; error: number; total?: number }, type: 'success' | 'error'): number {
    if (!this.dashboard) return 0;
    const maxTotal = Math.max(...this.dashboard.seriesStats.map(p => p.total || (p.success + p.error)), 1);
    const value = type === 'success' ? point.success : point.error;
    return (value / maxTotal) * 100;
  }

  private normalizeDashboard(data: BillingDashboard): BillingDashboard {
    return {
      ...data,
      totalProcessed: data.totalProcessed ?? 0,
      successCount: data.successCount ?? 0,
      errorCount: data.errorCount ?? 0,
      successRate: data.successRate ?? 0,
      averageProcessingTimeMs: data.averageProcessingTimeMs ?? 0,
      recentErrors: Array.isArray(data.recentErrors) ? data.recentErrors : [],
      seriesStats: Array.isArray(data.seriesStats) ? data.seriesStats : [],
    };
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
