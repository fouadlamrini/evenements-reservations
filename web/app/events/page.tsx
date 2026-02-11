"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import Link from "next/link";
import api from "../../services/api";

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

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      // Fetch stats for each event
      const eventsWithStats = await Promise.all(
        response.data.map(async (event: Event) => {
          try {
            const statsResponse = await api.get(`/events/${event._id}/stats`);
            return { ...event, ...statsResponse.data };
          } catch {
            return event; // Fallback to basic event data
          }
        })
      );
      setEvents(eventsWithStats);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading events...</div>
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
            <h1 className="text-4xl font-bold text-white mb-4">
              Upcoming Events
            </h1>
            <p className="text-gray-400">
              Discover and reserve your spot at amazing events
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400 mb-4">No events available</p>
              <p className="text-gray-500">Check back later for new events</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {event.title}
                      </h3>
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {event.status}
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{event.maxCapacity} capacity</span>
                      </div>
                      
                      {/* Reservation Stats */}
                      {event.confirmedReservations !== undefined && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-400 font-bold">
                              📊 {event.confirmedReservations}/{event.maxCapacity}
                            </span>
                            <span className="text-yellow-400 font-bold">
                              {event.fillRate}% rempli
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(event.fillRate || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {event.maxCapacity - (event.confirmedReservations || 0)} places disponibles
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/events/${event._id}`}
                      className="block w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded text-center transition-colors"
                    >
                      View Details
                    </Link>
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
