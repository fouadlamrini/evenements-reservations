"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import Link from "next/link";
import api from "../../../services/api";

interface Reservation {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
  };
  status: "PENDING" | "CONFIRMED" | "REFUSED" | "CANCELED";
  canceledBy?: "ADMIN" | "PARTICIPANT";
  createdAt: string;
}

export default function ParticipantReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // No need to check user role here for basic access
    // The API will handle authorization
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await api.get("/reservations/my");
      setReservations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await api.patch(`/reservations/${reservationId}/cancel`);
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

  const canCancel = (status: string) => {
    return status === "PENDING" || status === "CONFIRMED";
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading reservations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-black">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">My Reservations</h1>
            <p className="text-gray-400">Manage your event reservations</p>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400 mb-4">No reservations found</p>
              <Link
                href="/events"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded inline-block transition-colors"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {reservations.map((reservation) => (
                <div key={reservation._id} className="bg-gray-900 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {reservation.eventId.title}
                      </h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">
                        {reservation.eventId.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <span>📅 {new Date(reservation.eventId.date).toLocaleDateString()}</span>
                        <span>⏰ {reservation.eventId.time}</span>
                        <span>📍 {reservation.eventId.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={getStatusBadge(reservation.status, reservation.canceledBy)}>
                        {getStatusText(reservation.status, reservation.canceledBy)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/events/${reservation.eventId._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      View Event
                    </Link>
                    
                    {canCancel(reservation.status) && (
                      <button
                        onClick={() => handleCancel(reservation._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
