export class DashboardStatsDto {
  totalEvents: number;
  upcomingEvents: number;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  refusedReservations: number;
  canceledReservations: number;
  averageFillRate: number;
  recentEvents: any[];
  recentReservations: any[];
}
