"use client";

import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { IEvent } from "@/types";

export default function SingleEvent() {
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const eventData = await response.json();
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleDeleteEvent = async () => {
    if (!event) return;
    try {
      const response = await fetch(`/api/deleteEvent/${event._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Event deleted");
        router.push("/events");
      } else {
        toast.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("An error occurred while deleting event");
    } finally {
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pb-12">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8">
          <Loader />
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-slate-50 min-h-screen pb-12">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8">
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="mt-2 text-sm font-medium text-slate-900">Event not found</h3>
            <div className="mt-4">
              <Link href="/events">
                <button className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center mx-auto">
                  <span className="mr-1">&larr;</span> Back to Events
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          <div className="p-8 md:p-12 flex-grow">
            <Link href="/events" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center mb-6">
              <span className="mr-1 text-2xl pb-2">&larr;</span> Back to Events
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Event Details
            </h1>
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl text-slate-800 leading-relaxed font-medium">
                {event.description}
              </p>
            </div>
          </div>
          
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
             <div className="text-sm text-slate-500">
               {/* Event ID: {event._id} */}
             </div>
             <div className="flex gap-3">
              {session?.user?.permissions?.includes("event-update") && (
                <Link
                  href={`/events/update?id=${event._id}&description=${encodeURIComponent(event.description)}`}
                >
                  <button className="cursor-pointer px-5 py-2 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition-colors">
                    Edit Event
                  </button>
                </Link>
              )}
              {session?.user?.permissions?.includes("event-delete") && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer px-5 py-2 text-sm font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-colors"
                >
                  Delete Event
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={handleDeleteEvent}
        onCancel={() => setIsModalOpen(false)}
        confirmText="Delete"
      />
    </div>
  );
}