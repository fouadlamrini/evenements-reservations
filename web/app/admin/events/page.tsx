"use client";

import { useState, useEffect } from "react";
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
}

export default function AdminEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      window.location.href = "/";
      return;
    }

    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events/admin");
      setEvents(response.data);
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
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
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
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      <span>⏰ {event.time}</span>
                      <span>📍 {event.location}</span>
                      <span>👥 {event.maxCapacity} capacity</span>
                    </div>
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
