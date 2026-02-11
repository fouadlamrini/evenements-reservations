"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../context/AuthContext";
import AdminSidebar from "../../../../../components/AdminSidebar";
import Link from "next/link";
import api from "../../../../../services/api";

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

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxCapacity: "",
    status: "DRAFT",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      router.push("/");
      return;
    }

    fetchEvent();
  }, [user, eventId]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/admin/${eventId}`);
      setEvent(response.data);
      
      // Format date for input field (YYYY-MM-DD)
      const eventDate = new Date(response.data.date);
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      setFormData({
        title: response.data.title,
        description: response.data.description,
        date: formattedDate,
        time: response.data.time,
        location: response.data.location,
        maxCapacity: response.data.maxCapacity.toString(),
        status: response.data.status,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch event");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear date error when user changes the date
    if (name === "date") {
      setDateError("");
    }
  };

  const validateDate = (dateString: string) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    
    if (selectedDate <= today) {
      setDateError("La date de l'événement doit être dans le futur");
      return false;
    }
    
    setDateError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date before submitting
    if (!validateDate(formData.date)) {
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      const eventData = {
        ...formData,
        date: new Date(formData.date),
        maxCapacity: parseInt(formData.maxCapacity),
      };

      await api.patch(`/events/${eventId}`, eventData);
      router.push("/admin/events");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="text-white text-center">Loading event...</div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Edit Event</h1>
          <Link
            href="/admin/events"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Events
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl">
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-white font-medium mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-white font-medium mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                placeholder="Describe your event"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-white font-medium mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]} // Set min date to today
                  className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-yellow-500 ${
                    dateError ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {dateError && (
                  <p className="text-red-400 text-sm mt-1">⚠️ {dateError}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-white font-medium mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-white font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                placeholder="Event location"
              />
            </div>

            <div>
              <label htmlFor="maxCapacity" className="block text-white font-medium mb-2">
                Maximum Capacity *
              </label>
              <input
                type="number"
                id="maxCapacity"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                placeholder="Maximum number of attendees"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-white font-medium mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELED">Canceled</option>
              </select>
              <p className="text-gray-400 text-sm mt-1">
                Draft events are not visible to the public. Published events are visible to everyone.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update Event"}
              </button>
              
              <Link
                href="/admin/events"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
