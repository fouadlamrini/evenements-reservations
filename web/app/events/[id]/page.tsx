"use client";

import { useState, useEffect } from "react";
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
}

export default function EventDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${params.id}`);
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Event not found");
    } finally {
      setLoading(false);
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
      setError(err.response?.data?.message || "Failed to make reservation");
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
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded transition-colors"
                >
                  {reserving ? "Reserving..." : "Reserve Your Spot"}
                </button>
                
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
