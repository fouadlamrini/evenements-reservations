"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../services/api";

interface DashboardStats {
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

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "Admin")) {
      router.replace("/");
      return;
    }

    if (user?.role === "Admin") {
      fetchDashboardStats();
    }
  }, [user, isLoading, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events/dashboard/stats");
      setStats(response.data);
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!user || user.role !== "Admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Access denied</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back, {user.email}! Here's your event management overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Events */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Events</p>
                <p className="text-2xl font-bold text-green-400">{stats.upcomingEvents}</p>
              </div>
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Reservations */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Reservations</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalReservations}</p>
              </div>
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Fill Rate */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Fill Rate</p>
                <p className="text-2xl font-bold text-purple-400">{stats.averageFillRate}%</p>
              </div>
              <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Reservation Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Confirmed</span>
                </div>
                <span className="text-green-400 font-semibold">{stats.confirmedReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Pending</span>
                </div>
                <span className="text-yellow-400 font-semibold">{stats.pendingReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Refused</span>
                </div>
                <span className="text-red-400 font-semibold">{stats.refusedReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Canceled</span>
                </div>
                <span className="text-gray-400 font-semibold">{stats.canceledReservations}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/admin/events")}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Manage Events
              </button>
              <button
                onClick={() => router.push("/admin/reservations")}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Manage Reservations
              </button>
              <button
                onClick={() => router.push("/events/create")}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Create Event
              </button>
              <button
                onClick={() => router.push("/admin/users")}
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Manage Users
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Events</h2>
            <div className="space-y-3">
              {stats.recentEvents?.length > 0 ? (
                stats.recentEvents.map((event: any) => (
                  <div key={event._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-gray-400 text-sm">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.status === 'PUBLISHED' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                      event.status === 'DRAFT' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                      'bg-red-500 bg-opacity-20 text-red-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No recent events</p>
              )}
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Reservations</h2>
            <div className="space-y-3">
              {stats.recentReservations?.length > 0 ? (
                stats.recentReservations.map((reservation: any) => (
                  <div key={reservation._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{reservation.eventId?.title || 'Unknown Event'}</p>
                      <p className="text-gray-400 text-sm">{reservation.participantId?.email || 'Unknown User'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      reservation.status === 'CONFIRMED' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                      reservation.status === 'PENDING' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                      reservation.status === 'REFUSED' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                      'bg-gray-500 bg-opacity-20 text-gray-400'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No recent reservations</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
