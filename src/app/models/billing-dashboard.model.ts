export interface BillingDashboard {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageProcessingTimeMs: number;
  queryFrom: string;
  queryTo: string;
  recentErrors: InvoiceDetail[];
  seriesStats: SeriesStatsPoint[];
}

export interface InvoiceDetail {
  id: string;
  fecha: string | null;
  serie: string | null;
  folio: number | null;
  rfcReceptor: string | null;
  xmlGenerado: boolean | null;
  pdfGenerado: boolean | null;
  mensaje: string | null;
  tiempoProceso: number | null;
}

export interface SeriesStatsPoint {
  serie: string;
  success: number;
  error: number;
  total: number;
}
