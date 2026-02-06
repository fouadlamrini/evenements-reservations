"use client";

import { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../../services/api";

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

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Event not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading event...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/events"
            className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
          >
            ← Back to Events
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="p-8">
            {/* Event Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    PUBLISHED
                  </span>
                  <span className="text-sm">
                    Created {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Description */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">About this Event</h2>
                <p className="text-gray-300 leading-relaxed mb-6">{event.description}</p>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <span className="font-medium mr-2">📅 Date:</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="font-medium mr-2">⏰ Time:</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="font-medium mr-2">📍 Location:</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="font-medium mr-2">👥 Capacity:</span>
                      <span>{event.maxCapacity} attendees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Actions */}
              <div>
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Ready to Join?</h3>
                  <p className="text-gray-300 mb-6">
                    Don't miss out on this amazing event! Register now to secure your spot.
                  </p>
                  
                  <div className="space-y-3">
                    <Link
                      href="/register"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg text-center transition-colors block"
                    >
                      Register to Join
                    </Link>
                    
                    <Link
                      href="/events"
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors block"
                    >
                      Browse More Events
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
