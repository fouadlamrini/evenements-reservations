"use client";

import { useState, useEffect } from "react";
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
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      // Only show published events for participants
      const publishedEvents = response.data.filter((event: Event) => event.status === "PUBLISHED");
      setEvents(publishedEvents);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading events...</div>
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Upcoming Events</h1>
          <p className="text-gray-400 text-lg">Discover and join amazing events</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No events available</div>
            <p className="text-gray-500">Check back later for new events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        PUBLISHED
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center">
                      📅 {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      ⏰ {event.time}
                    </span>
                    <span className="flex items-center">
                      📍 {event.location}
                    </span>
                    <span className="flex items-center">
                      👥 {event.maxCapacity} capacity
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-500 text-sm">
                      Created {new Date(event.createdAt).toLocaleDateString()}
                    </div>
                    <Link
                      href={`/events/${event._id}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
