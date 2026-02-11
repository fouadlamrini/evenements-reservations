"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import api from "../services/api";

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

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    // Only redirect if we're not already on the correct page and auth is resolved
    if (!isLoading && pathname === "/") {
      if (user?.role === "Admin") {
        router.replace("/admin/events");
      } else if (user) {
        router.replace("/events");
      }
      // If no user, stay on home page (they can login from here)
    }
    
    // Fetch latest events for home page
    if (!user && !isLoading) {
      fetchLatestEvents();
    }
  }, [user, isLoading, pathname, router]);

  const fetchLatestEvents = async () => {
    try {
      const response = await api.get("/events?limit=3&sort=createdAt:desc");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500 bg-opacity-20 text-green-400 border-green-500';
      case 'DRAFT':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500';
      case 'CANCELED':
        return 'bg-red-500 bg-opacity-20 text-red-400 border-red-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-400 border-gray-500';
    }
  };

  // Show loading while auth is being resolved
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show redirecting message for authenticated users
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-400"></div>
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-yellow-400">EventReserve</span>
              <span className="block text-white">Réservez vos événements</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              La plateforme moderne pour gérer, réserver et suivre tous vos événements en un seul endroit
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/events"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Voir les événements
              </Link>
              <Link
                href="/login"
                className="bg-transparent hover:bg-white hover:text-black border-2 border-white text-white font-bold py-4 px-8 rounded-lg text-lg transition-all"
              >
                Se connecter
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V7m0 0l-4-4m4 4l-4 4m6 4v4m0 0l-4-4m4 4l-4 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Création</h3>
                <p className="text-gray-400">Créez et gérez vos événements facilement</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Réservation</h3>
                <p className="text-gray-400">Réservez votre place en quelques clics</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Tickets</h3>
                <p className="text-gray-400">Téléchargez vos tickets PDF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7l-7-7m7 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" />
          </svg>
        </div>
      </section>

      {/* Latest Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Derniers <span className="text-yellow-400">Événements</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Découvrez les derniers événements ajoutés à notre plateforme
            </p>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Aucun événement disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event._id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-yellow-500 transition-all duration-300 hover:transform hover:scale-105">
                  {/* Event Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEventStatusColor(event.status)}`}>
                        {event.status === 'PUBLISHED' ? 'Publié' : 
                         event.status === 'DRAFT' ? 'Brouillon' : 
                         event.status === 'CANCELED' ? 'Annulé' : event.status}
                      </span>
                      <div className="text-gray-400 text-sm">
                        {event.maxCapacity} places
                      </div>
                    </div>
                    
                    {/* Event Title */}
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    {/* Event Description */}
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    {/* Event Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V7m0 0l-4-4m4 4l-4 4m6 4v4m0 0l-4-4m4 4l-4 4" />
                        </svg>
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0l4.243 4.243a8 8 0 0111.314 0l4.242-4.243a1.998 1.998 0 01-2.829 0l-4.244 4.242L12 15.657z" />
                        </svg>
                        {event.location}
                      </div>
                    </div>
                  </div>
                  
                  {/* Event Footer */}
                  <div className="bg-gray-700 px-6 py-4">
                    <Link
                      href={`/events/${event._id}`}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Events Button */}
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Voir tous les événements
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4m4 4l-4 4m-4 4v4m0 0l-4-4m4 4l-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">À propos</h3>
              <p className="text-gray-400">
                EventReserve est la plateforme moderne pour la gestion d'événements, 
                conçue pour simplifier les réservations et optimiser l'expérience utilisateur.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Fonctionnalités</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Gestion complète des événements</li>
                <li>• Réservation en ligne</li>
                <li>• Tickets PDF automatiques</li>
                <li>• Dashboard administratif</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: contact@eventreserve.ma<br/>
                Téléphone: +212 5XX-XXX-XXX
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 EventReserve. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
