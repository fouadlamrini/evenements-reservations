"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import Link from "next/link";
import api from "../../../services/api";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxCapacity: number;
  status: string;
  confirmedReservations?: number;
  totalReservations?: number;
  fillRate?: number;
}

export default function EventDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reserving, setReserving] = useState(false);
  const [userReservation, setUserReservation] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
      if (user) {
        checkUserReservation();
      }
    }
  }, [params.id, user]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${params.id}/stats`);
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Event not found");
    } finally {
      setLoading(false);
    }
  };

  const checkUserReservation = async () => {
    try {
      const response = await api.get('/reservations/my');
      const reservations = response.data;
      const userRes = reservations.find((res: any) => res.eventId._id === params.id);
      setUserReservation(userRes || null);
    } catch (err: any) {
      // No reservation found, which is expected
      setUserReservation(null);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setReserving(true);
    try {
      await api.post("/reservations", { eventId: params.id });
      router.push("/participant/reservations");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to make reservation";
      
      // Convert technical errors to user-friendly messages
      if (errorMessage.includes("already have a reservation")) {
        setError("Vous avez déjà une réservation pour cet événement.");
      } else if (errorMessage.includes("event is full")) {
        setError("Cet événement est complet. Plus de places disponibles.");
      } else if (errorMessage.includes("not published")) {
        setError("Cet événement n'est pas encore disponible.");
      } else if (errorMessage.includes("canceled")) {
        setError("Cet événement a été annulé.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer plus tard.");
      }
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading event...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/events"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
          >
            ← Back to Events
          </Link>

          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">About this event</h2>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </div>

              {/* Reservation Statistics */}
              {event.confirmedReservations !== undefined && (
                <div className="mb-8 bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📊 Réservations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {event.confirmedReservations}/{event.maxCapacity}
                      </div>
                      <div className="text-gray-400 text-sm">Places confirmées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">
                        {event.fillRate}%
                      </div>
                      <div className="text-gray-400 text-sm">Taux de remplissage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">
                        {event.maxCapacity - event.confirmedReservations}
                      </div>
                      <div className="text-gray-400 text-sm">Places disponibles</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(event.fillRate || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-gray-400 text-sm mt-2">
                      {(event.fillRate || 0) >= 80 ? "⚠️ Presque complet" : 
                       (event.fillRate || 0) >= 50 ? "🟡 Moitié rempli" : "🟢 Places disponibles"}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <p className="text-gray-400 text-sm">Time</p>
                      <p className="text-white font-medium">{event.time}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="text-gray-400 text-sm">Capacity</p>
                      <p className="text-white font-medium">{event.maxCapacity} people</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6 flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-4">
                {user?.role === "Admin" ? (
                  <div className="flex-1 bg-gray-600 text-gray-300 py-3 px-6 rounded font-bold text-center">
                    🚫 Les administrateurs ne peuvent pas réserver d'événements
                  </div>
                ) : userReservation ? (
                  <div className="flex-1 space-y-3">
                    <div className="bg-green-600 text-white py-3 px-6 rounded font-bold text-center">
                      ✅ Vous avez déjà réservé cet événement
                    </div>
                    <Link
                      href="/participant/reservations"
                      className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-center transition-colors"
                    >
                      Voir mes réservations
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleReserve}
                    disabled={reserving}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded transition-colors"
                  >
                    {reserving ? "Reserving..." : "Reserve Your Spot"}
                  </button>
                )}
                
                {user?.role === "Admin" && (
                  <Link
                    href={`/admin/events/${event._id}/edit`}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded transition-colors"
                  >
                    Edit Event
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
