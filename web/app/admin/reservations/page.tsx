"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import AdminSidebar from "../../../components/AdminSidebar";
import Link from "next/link";
import api from "../../../services/api";

interface Reservation {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
  participantId: {
    _id: string;
    name: string;
    email: string;
  };
  status: "PENDING" | "CONFIRMED" | "REFUSED" | "CANCELED";
  canceledBy?: "ADMIN" | "PARTICIPANT";
  createdAt: string;
}

export default function AdminReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // No need to check user role here - layout handles it
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await api.get("/reservations");
      setReservations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (reservationId: string) => {
    try {
      await api.patch(`/reservations/${reservationId}/confirm`);
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to confirm reservation");
    }
  };

  const handleRefuse = async (reservationId: string) => {
    if (!confirm("Are you sure you want to refuse this reservation?")) {
      return;
    }

    try {
      await api.patch(`/reservations/${reservationId}/refuse`);
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to refuse reservation");
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await api.patch(`/reservations/${reservationId}/cancel-admin`);
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel reservation");
    }
  };

  const getStatusBadge = (status: string, canceledBy?: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold";
    
    switch (status) {
      case "PENDING":
        return `${baseClasses} bg-yellow-500 text-black`;
      case "CONFIRMED":
        return `${baseClasses} bg-green-500 text-white`;
      case "REFUSED":
        return `${baseClasses} bg-red-500 text-white`;
      case "CANCELED":
        return `${baseClasses} ${canceledBy === "ADMIN" ? "bg-orange-500" : "bg-gray-500"} text-white`;
      default:
        return `${baseClasses} bg-gray-500 text-white`;
    }
  };

  const getStatusText = (status: string, canceledBy?: string) => {
    if (status === "CANCELED" && canceledBy) {
      return `CANCELED (${canceledBy})`;
    }
    return status;
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === "all") return true;
    return reservation.status === filter;
  });

  const canConfirm = (status: string) => status === "PENDING";
  const canRefuse = (status: string) => status === "PENDING" || status === "CONFIRMED";
  const canCancel = (status: string) => status === "PENDING" || status === "CONFIRMED";

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading reservations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Reservations Management</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-400">Filter by status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-yellow-500 focus:outline-none"
            >
              <option value="all">All Reservations</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REFUSED">Refused</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">No reservations found</p>
            <p className="text-gray-500">
              {filter === "all" ? "There are no reservations yet" : `No ${filter.toLowerCase()} reservations`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredReservations.map((reservation) => (
              <div key={reservation._id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {reservation.eventId.title}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-400">
                          <span className="font-medium">Participant:</span> {reservation.participantId.name}
                        </p>
                        <p className="text-gray-400">
                          <span className="font-medium">Email:</span> {reservation.participantId.email}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-400">
                          <span className="font-medium">Date:</span> {new Date(reservation.eventId.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400">
                          <span className="font-medium">Time:</span> {reservation.eventId.time}
                        </p>
                        <p className="text-gray-400">
                          <span className="font-medium">Location:</span> {reservation.eventId.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={getStatusBadge(reservation.status, reservation.canceledBy)}>
                        {getStatusText(reservation.status, reservation.canceledBy)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created: {new Date(reservation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/events/${reservation.eventId._id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    View Event
                  </Link>
                  
                  {canConfirm(reservation.status) && (
                    <button
                      onClick={() => handleConfirm(reservation._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  
                  {canRefuse(reservation.status) && (
                    <button
                      onClick={() => handleRefuse(reservation._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Refuse
                    </button>
                  )}
                  
                  {canCancel(reservation.status) && (
                    <button
                      onClick={() => handleCancel(reservation._id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Cancel (Admin)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
