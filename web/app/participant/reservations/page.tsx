"use client";

import React, { useState, useEffect } from "react";
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
  } | null;
  status: "PENDING" | "CONFIRMED" | "REFUSED" | "CANCELED";
  canceledBy?: "ADMIN" | "PARTICIPANT";
  createdAt: string;
}

export default function ParticipantReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  useEffect(() => {
    // No need to check user role here for basic access
    // The API will handle authorization
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await api.get("/reservations/my");
      console.log("API Response:", response.data); // Debug log
      
      // Filter out reservations with missing event data or handle them gracefully
      const processedReservations = response.data.map((reservation: any) => {
        // If eventId is null or doesn't have required properties, mark it as missing
        if (!reservation.eventId || !reservation.eventId.title) {
          return {
            ...reservation,
            eventId: null
          };
        }
        return reservation;
      });
      
      setReservations(processedReservations);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    setConfirmMessage("Êtes-vous sûr de vouloir annuler cette réservation ?");
    setReservationToCancel(reservationId);
  };

  const executeCancel = async () => {
    if (!reservationToCancel) return;
    
    try {
      await api.patch(`/reservations/${reservationToCancel}/cancel`);
      fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel reservation");
    } finally {
      setConfirmMessage("");
      setReservationToCancel(null);
    }
  };

  const handleDownloadTicket = async (reservationId: string) => {
    try {
      const response = await api.post(`/tickets/generate/${reservationId}`);
      const { fileName } = response.data.data;
      
      // Create download link with proper uploads prefix using API base URL
      const downloadUrl = `http://localhost:3001/uploads/tickets/${fileName}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate ticket");
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

  const canDownloadTicket = (status: string) => {
    return status === "CONFIRMED";
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
      {/* Confirmation Modal */}
      {confirmMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Confirmation</h3>
            <p className="text-gray-300 mb-6">{confirmMessage}</p>
            <div className="flex gap-4">
              <button
                onClick={executeCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Oui
              </button>
              <button
                onClick={() => {
                  setConfirmMessage("");
                  setReservationToCancel(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                        {reservation.eventId?.title || 'Événement supprimé'}
                      </h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">
                        {reservation.eventId?.description || 'Cet événement a été supprimé par l\'administrateur'}
                      </p>
                      {reservation.eventId && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                          <span>📅 {new Date(reservation.eventId.date).toLocaleDateString()}</span>
                          <span>⏰ {reservation.eventId.time}</span>
                          <span>📍 {reservation.eventId.location}</span>
                        </div>
                      )}
                      {!reservation.eventId && (
                        <div className="bg-orange-900 border border-orange-700 text-orange-200 px-3 py-2 rounded text-sm">
                          Cette réservation n\'est plus valide car l\'événement a été supprimé
                        </div>
                      )}
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
                    {reservation.eventId && (
                      <Link
                        href={`/events/${reservation.eventId._id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        View Event
                      </Link>
                    )}
                    
                    {reservation.eventId && canDownloadTicket(reservation.status) && (
                      <button
                        onClick={() => handleDownloadTicket(reservation._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        📄 Download Ticket
                      </button>
                    )}
                    
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
