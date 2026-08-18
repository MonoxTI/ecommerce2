"use client";
// app/services/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface Service {
  id: string; name: string; description: string;
  duration: number; price: number; category: string;
}
interface Appointment {
  id: string; date: string; startTime: string; endTime: string;
  status: string; service: Service;
}
interface AvailableDay {
  date: string;
  label: string;
}

function formatPrice(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

// Helper to get local date string (YYYY-MM-DD) without UTC timezone shifts
const getLocalDateStr = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const CATEGORY_LABELS: Record<string, string> = {
  "makeup":       "Makeup",
  "installation": "Wig Installation",
  "wig-care":     "Wig Care",
};

const CATEGORY_ICONS: Record<string, string> = {
  "makeup":       "✦",
  "installation": "◈",
  "wig-care":     "◇",
};

export default function ServicesPage() {
  const router   = useRouter();
  const { user } = useAuthStore();

  const [services, setServices]             = useState<Service[]>([]);
  const [myAppointments, setMyAppts]        = useState<Appointment[]>([]);
  const [loading, setLoading]               = useState(true);
  const [availableDays, setAvailableDays]   = useState<AvailableDay[]>([]);
  const [daysLoading, setDaysLoading]       = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate]     = useState("");
  const [slots, setSlots]                   = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading]     = useState(false);
  const [selectedSlot, setSelectedSlot]     = useState("");
  const [notes, setNotes]                   = useState("");
  const [booking, setBooking]               = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError]                   = useState("");
  const [tab, setTab]                       = useState<"services" | "my-appointments">("services");

  // Load services and appointments
  useEffect(() => {
    Promise.all([
      fetch("/api/services", { credentials: "include" }).then(r => r.json()),
      user ? fetch("/api/appointments", { credentials: "include" }).then(r => r.json()) : Promise.resolve(null),
    ]).then(([svcRes, apptRes]) => {
      if (svcRes?.data) setServices(Array.isArray(svcRes.data) ? svcRes.data : []);
      if (apptRes?.data) setMyAppts(Array.isArray(apptRes.data) ? apptRes.data : []);
      setLoading(false);
    });
  }, [user]);

  // When a service is selected — fetch which days have availability for it
  useEffect(() => {
    if (!selectedService) return;
    setAvailableDays([]);
    setSelectedDate("");
    setSelectedSlot("");
    setSlots([]);
    setDaysLoading(true);

    // Get admin availability (which days of week are active)
    fetch("/api/services/availability/days", { credentials: "include" })
      .then(r => r.json())
      .then(({ data }) => {
        // data = { days: [1,2,3], dates: ["2026-06-20"] }
        const recurringDays: number[] = Array.isArray(data?.days)  ? data.days  : [];
        const specificDates: string[] = Array.isArray(data?.dates) ? data.dates : [];

        // Generate next 30 days
        const today = new Date();
        const todayStr = getLocalDateStr(today);
        const days: AvailableDay[] = [];

        // Add recurring days
        for (let i = 1; i <= 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dateStr = getLocalDateStr(d);
          if (recurringDays.includes(d.getDay()) && !specificDates.includes(dateStr)) {
            days.push({
              date:  dateStr,
              label: d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" }),
            });
          }
        }

        // Add specific dates (only future ones)
        for (const dateStr of specificDates) {
          if (dateStr > todayStr && !days.find(d => d.date === dateStr)) {
            const d = new Date(dateStr + "T00:00:00");
            days.push({
              date:  dateStr,
              label: d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" }),
            });
          }
        }

        // Sort by date
        days.sort((a, b) => (a.date > b.date ? 1 : -1));
        setAvailableDays(days);
        setDaysLoading(false);
      })
      .catch(() => setDaysLoading(false));
  }, [selectedService]);

  // When a date is selected — fetch available time slots
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot("");
    setSlots([]);
    fetch(`/api/services/availability?date=${selectedDate}&serviceId=${selectedService.id}`, {
      credentials: "include",
    })
      .then(r => r.json())
      .then(({ data }) => {
        setSlots(Array.isArray(data) ? data : []);
        setSlotsLoading(false);
      })
      .catch(() => setSlotsLoading(false));
  }, [selectedService, selectedDate]);

  async function book() {
    if (!user) { router.push("/auth/login?redirect=/services"); return; }
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setBooking(true); setError("");
    
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serviceId: selectedService.id,
          date:      selectedDate,
          startTime: selectedSlot,
          notes,
        }),
      });
      const json = await res.json();
      setBooking(false);
      
      if (!res.ok) {
        return setError(json.error ?? "Booking failed. Please try again.");
      }
      
      setBookingSuccess(true);
      setMyAppts(prev => [json.data, ...prev]);
      
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedService(null);
        setSelectedDate("");
        setSelectedSlot("");
        setNotes("");
        setTab("my-appointments");
      }, 2000);
    } catch (err) {
      setBooking(false);
      setError("Network error. Please try again.");
    }
  }

  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="min-h-screen bg-[#F1F1F1] pt-24 pb-20 font-cormorant">
      <div className="max-w-5xl mx-auto px-6 md:px-8">

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-black/10">
          <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-black/40 mb-6">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>›</span>
            <span className="text-black/70">Services</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px bg-black/30" />
            <span className="text-xs tracking-[0.3em] uppercase text-black/50">Book with Us</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-black font-light mb-3">Our Services</h1>
          <p className="text-[#666] text-base">Professional wig installation, makeup, and hair care services.</p>
        </div>

        {/* Tabs — only shown when logged in */}
        {user && (
          <div className="flex gap-0 mb-8 border-b border-black/10">
            {[
              { key: "services" as const,        label: "Book a Service" },
              { key: "my-appointments" as const, label: `My Appointments${myAppointments.length ? ` (${myAppointments.length})` : ""}` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-6 py-3 text-xs tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                  tab === t.key ? "border-black text-black font-medium" : "border-transparent text-[#666] hover:text-black"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* SERVICES TAB */}
        {tab === "services" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Service list */}
            <div className="lg:col-span-2 space-y-8">
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-black/5 animate-pulse" />)}
                </div>
              ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-16 border border-dashed border-black/10">
                  <p className="text-[#666]">No services available yet. Check back soon.</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, svcs]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-black/40">{CATEGORY_ICONS[category] ?? "◆"}</span>
                      <h2 className="font-serif text-xl text-black font-light">
                        {CATEGORY_LABELS[category] ?? category}
                      </h2>
                      <div className="flex-1 h-px bg-black/8" />
                    </div>
                    <div className="space-y-3">
                      {svcs.map(svc => (
                        <div key={svc.id}
                          onClick={() => setSelectedService(svc)}
                          className={`p-5 border cursor-pointer transition-all ${
                            selectedService?.id === svc.id
                              ? "border-black bg-black/[0.02]"
                              : "border-black/8 bg-white hover:border-black/30"
                          }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-serif text-lg text-black font-light">{svc.name}</h3>
                                {selectedService?.id === svc.id && (
                                  <span className="text-[0.6rem] tracking-widest uppercase bg-black text-white px-2 py-0.5">Selected</span>
                                )}
                              </div>
                              <p className="text-[#666] text-sm leading-relaxed">{svc.description}</p>
                              <p className="text-black/40 text-xs mt-2 tracking-wider">{svc.duration} min</p>
                            </div>
                            <div className="ml-4 text-right flex-shrink-0">
                              <p className="font-serif text-2xl text-black">{formatPrice(svc.price)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Booking panel */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-black/8 p-6 sticky top-24">
                {!selectedService ? (
                  <div className="text-center py-8">
                    <p className="text-[#666] text-sm mb-2">Select a service</p>
                    <p className="text-black/30 text-xs">to see available dates and times</p>
                  </div>
                ) : (
                  <>
                    {/* Selected service summary */}
                    <div className="mb-5 pb-5 border-b border-black/8">
                      <p className="text-black/50 text-xs tracking-widest uppercase mb-1">Selected Service</p>
                      <p className="font-serif text-lg text-black">{selectedService.name}</p>
                      <p className="text-[#666] text-sm">{selectedService.duration} min · {formatPrice(selectedService.price)}</p>
                    </div>

                    {/* Date picker — only shows days admin has set availability */}
                    <div className="mb-5">
                      <p className="text-black/50 text-xs tracking-widest uppercase mb-3">Available Dates</p>
                      {daysLoading ? (
                        <div className="grid grid-cols-2 gap-2">
                          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-black/5 animate-pulse" />)}
                        </div>
                      ) : availableDays.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-black/10">
                          <p className="text-[#666] text-sm">No availability set</p>
                          <p className="text-black/30 text-xs mt-1">Please check back later</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                          {availableDays.map(d => (
                            <button key={d.date} onClick={() => setSelectedDate(d.date)}
                              className={`px-3 py-2.5 text-xs text-left border transition-colors ${
                                selectedDate === d.date
                                  ? "border-black bg-black text-white"
                                  : "border-black/10 hover:border-black/40 text-[#444]"
                              }`}>
                              <span className="block font-medium">{d.label.split(",")[0]}</span>
                              <span className="block text-[0.65rem] opacity-70 mt-0.5">{d.label.split(",")[1]?.trim()}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Time slots — only shows after date selected */}
                    {selectedDate && (
                      <div className="mb-5">
                        <p className="text-black/50 text-xs tracking-widest uppercase mb-3">Available Times</p>
                        {slotsLoading ? (
                          <div className="grid grid-cols-3 gap-2">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="h-9 bg-black/5 animate-pulse" />)}
                          </div>
                        ) : slots.length === 0 ? (
                          <div className="py-4 text-center border border-dashed border-black/10">
                            <p className="text-[#666] text-sm">No times available</p>
                            <p className="text-black/30 text-xs mt-1">All slots are booked — try another date</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {slots.map(slot => (
                              <button key={slot} onClick={() => setSelectedSlot(slot)}
                                className={`py-2 text-xs text-center border transition-colors ${
                                  selectedSlot === slot
                                    ? "border-black bg-black text-white"
                                    : "border-black/10 hover:border-black/40 text-[#444]"
                                }`}>
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {selectedSlot && (
                      <div className="mb-5">
                        <p className="text-black/50 text-xs tracking-widest uppercase mb-2">Notes (optional)</p>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                          placeholder="Any special requests or information…"
                          className="w-full bg-[#F8F8F8] border border-black/10 text-black px-3 py-2 text-sm outline-none focus:border-black transition-colors placeholder:text-black/30 resize-none"
                        />
                      </div>
                    )}

                    {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
                    {bookingSuccess && (
                      <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm mb-3">
                        ✓ Appointment booked! We will confirm shortly.
                      </div>
                    )}

                    <button onClick={book}
                      disabled={!selectedDate || !selectedSlot || booking}
                      className="w-full bg-black hover:opacity-80 text-white py-3 text-xs tracking-[0.2em] uppercase transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                      {booking ? "Booking…" : !user ? "Sign In to Book" : "Confirm Booking"}
                    </button>

                    {!user && (
                      <p className="text-[#666] text-xs text-center mt-3">
                        <Link href="/auth/login?redirect=/services" className="text-black underline underline-offset-4">
                          Sign in
                        </Link>
                        {" "}to book an appointment
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MY APPOINTMENTS TAB */}
        {tab === "my-appointments" && (
          <div className="max-w-2xl">
            {myAppointments.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-black/10">
                <p className="text-[#666] mb-4">No appointments yet</p>
                <button onClick={() => setTab("services")}
                  className="bg-black text-white px-6 py-2.5 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
                  Book Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myAppointments.map(appt => (
                  <div key={appt.id} className="bg-white border border-black/8 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-serif text-lg text-black font-light">{appt.service.name}</p>
                        <p className="text-[#666] text-sm mt-1">
                          {new Date(appt.date).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          {" "}at {appt.startTime} – {appt.endTime}
                        </p>
                        <p className="text-black/40 text-xs mt-1">{formatPrice(appt.service.price)} · {appt.service.duration} min</p>
                      </div>
                      <span className={`text-[0.65rem] tracking-widest uppercase px-2 py-1 border ${
                        appt.status === "CONFIRMED"  ? "border-green-300 text-green-700 bg-green-50" :
                        appt.status === "CANCELLED"  ? "border-red-300 text-red-600 bg-red-50" :
                        appt.status === "COMPLETED"  ? "border-black/20 text-black/60" :
                        "border-yellow-300 text-yellow-700 bg-yellow-50"
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}