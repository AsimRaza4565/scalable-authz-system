"use client";

import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { IEvent } from "@/types";

export default function Events() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await fetch("api/events");
        setEvents(await eventsData.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const response = await fetch(`/api/deleteEvent/${eventToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents((prev) => prev.filter((event) => event._id !== eventToDelete));
        toast.success("Event deleted");
      } else {
        await response.json();
        toast.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("An error occurred while deleting event");
    } finally {
      setIsModalOpen(false);
      setEventToDelete(null);
    }
  };

  const openDeleteModal = (eventId: string) => {
    setEventToDelete(eventId);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Events</h1>
            <p className="mt-2 text-sm text-slate-500">
              Browse and manage upcoming events and calendar items.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {session?.user?.permissions?.includes("event-create") && (
              <Link href={"/events/create"}>
                <button className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Post New Event
                </button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No events found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <Link href={`/events/${event._id}`} className="p-6 flex-grow flex flex-col hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4 flex-grow">
                    <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-800 text-base leading-relaxed line-clamp-4 flex-grow font-medium mt-1">
                      {event.description}
                    </p>
                  </div>
                </Link>
                
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 mt-auto">
                  {session?.user?.permissions?.includes("event-update") && (
                    <Link
                      href={`/events/update?id=${event._id}&description=${encodeURIComponent(event.description)}`}
                    >
                      <button className="cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors border border-emerald-200 text-sm font-medium">
                        Edit
                      </button>
                    </Link>
                  )}
                  {session?.user?.permissions?.includes("event-delete") && (
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigating to single event page
                        openDeleteModal(event._id);
                      }}
                      className="cursor-pointer text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-md transition-colors border border-rose-200 text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setIsModalOpen(false);
          setEventToDelete(null);
        }}
        confirmText="Delete"
      />
    </div>
  );
}
