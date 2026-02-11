"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import AdminSidebar from "../../../components/AdminSidebar";
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
  createdAt: string;
  confirmedReservations?: number;
  totalReservations?: number;
  fillRate?: number;
}

export default function AdminEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    // No need to check user role here - layout handles it
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events/admin");
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

  const handlePublish = async (eventId: string) => {
    try {
      await api.patch(`/events/${eventId}/publish`);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleCancel = async (eventId: string) => {
    try {
      await api.patch(`/events/${eventId}/cancel`);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleDelete = async (eventId: string) => {
    setConfirmMessage("Êtes-vous sûr de vouloir supprimer cet événement ?");
    setEventToDelete(eventId);
  };

  const executeDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await api.delete(`/events/${eventToDelete}`);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete event");
    } finally {
      setConfirmMessage("");
      setEventToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading events...</div>
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
        {/* Confirmation Modal */}
        {confirmMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-bold text-white mb-4">Confirmation</h3>
              <p className="text-gray-300 mb-6">{confirmMessage}</p>
              <div className="flex gap-4">
                <button
                  onClick={executeDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Oui
                </button>
                <button
                  onClick={() => {
                    setConfirmMessage("");
                    setEventToDelete(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Events Management</h1>
          <Link
            href="/admin/events/create"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold transition-colors inline-block"
          >
            Create New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            <p className="text-xl mb-4">No events found</p>
            <Link
              href="/admin/events/create"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-400 mb-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-3">
                      <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      <span>⏰ {event.time}</span>
                      <span>📍 {event.location}</span>
                      <span>👥 {event.maxCapacity} capacity</span>
                    </div>
                    
                    {/* Reservation Stats for Admin */}
                    {event.confirmedReservations !== undefined && (
                      <div className="bg-gray-700 rounded p-3 mb-3">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-400">
                              {event.confirmedReservations}
                            </div>
                            <div className="text-xs text-gray-400">Confirmés</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-400">
                              {event.fillRate}%
                            </div>
                            <div className="text-xs text-gray-400">Taux</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-400">
                              {event.maxCapacity - event.confirmedReservations}
                            </div>
                            <div className="text-xs text-gray-400">Disponibles</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(event.fillRate || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.status === "PUBLISHED"
                          ? "bg-green-500 text-white"
                          : event.status === "DRAFT"
                          ? "bg-gray-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {event.status === "DRAFT" && (
                    <button
                      onClick={() => handlePublish(event._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  
                  {event.status === "PUBLISHED" && (
                    <button
                      onClick={() => handleCancel(event._id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <Link
                    href={`/admin/events/${event._id}/edit`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
