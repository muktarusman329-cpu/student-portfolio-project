import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  Download,
  Filter,
  Headphones,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  User,
  Users,
  Wifi,
  X
} from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const fallbackHalls = [
  {
    id: "grand-aurora",
    name: "Grand Aurora Ballroom",
    capacity: 650,
    pricePerDay: 1800000,
    location: "Victoria Island, Lagos",
    availabilityStatus: "Available",
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85",
    features: ["AC", "Valet parking", "Grand stage", "Catering", "Decoration", "WiFi"],
    bookedDates: ["2026-05-22", "2026-06-06", "2026-06-21"]
  },
  {
    id: "opal-garden",
    name: "Opal Garden Pavilion",
    capacity: 320,
    pricePerDay: 950000,
    location: "Lekki Phase 1, Lagos",
    availabilityStatus: "Few slots",
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85",
    features: ["Outdoor lawn", "Lighting", "Catering", "Bridal suite", "WiFi"],
    bookedDates: ["2026-05-19", "2026-06-02", "2026-06-14"]
  },
  {
    id: "summit-hall",
    name: "Summit Conference Hall",
    capacity: 220,
    pricePerDay: 700000,
    location: "Ikeja GRA, Lagos",
    availabilityStatus: "Available",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85",
    features: ["Projector", "Hybrid meeting kit", "Stage", "Coffee bar", "WiFi"],
    bookedDates: ["2026-05-24", "2026-06-10"]
  }
];

const packages = [
  ["Wedding Royale", "For elegant ceremonies and receptions", 2500000, ["Premium hall", "Full decoration", "Catering for 250", "Bridal suite"]],
  ["Birthday Luxe", "Polished celebrations for all ages", 850000, ["Themed decor", "DJ booth", "Cake table", "Photo wall"]],
  ["Corporate Prime", "Conferences, summits, launches", 1200000, ["AV support", "Stage branding", "Tea break", "Hybrid stream"]],
  ["Party Signature", "Private parties and social nights", 650000, ["Lounge access", "Lighting", "Cocktail bar", "Security"]]
];

const gallery = [
  "https://images.unsplash.com/photo-1524777313293-86d2ab467344?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85"
];

const reviews = [
  ["The hall looked cinematic, the team handled every detail, and our guests still talk about the lighting.", "Teni A.", "Bride"],
  ["We booked a product launch in 10 minutes. The dashboard and reminders made coordination painless.", "David O.", "Founder"],
  ["Elegant venue, reliable payment flow, clear invoice, and the support team responded immediately.", "Mariam B.", "Event Planner"]
];

const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));

async function api(path, options = {}) {
  const token = localStorage.getItem("elite-token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(data?.message || data?.errors?.[0]?.msg || "Request failed");
  return data;
}

function App() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [halls, setHalls] = useState(fallbackHalls);
  const [bookings, setBookings] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [overview, setOverview] = useState(null);
  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState("all");
  const [selectedHall, setSelectedHall] = useState(fallbackHalls[0].id);
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("elite-session") || "null"));
  const [notice, setNotice] = useState("Live connection starting...");
  const [path, setPath] = useState(window.location.pathname);
  const [confirmation, setConfirmation] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "18:00",
    eventType: "Wedding",
    guests: 180,
    services: ["Catering", "Decoration"],
    notes: ""
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    refreshPublicData();
    const stream = new EventSource(`${API_URL}/events/stream`);
    stream.onopen = () => setNotice("Live updates connected");
    stream.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.payload?.halls) setHalls(message.payload.halls);
      if (message.payload?.bookings && session?.user?.role === "admin") setBookings(message.payload.bookings);
      if (message.payload?.supportMessages) setSupportMessages(message.payload.supportMessages);
      if (message.type !== "snapshot") setNotice(`${message.type.replace(".", " ")} updated just now`);
    };
    stream.onerror = () => setNotice("Live stream paused. Using API refresh.");
    return () => stream.close();
  }, [session?.user?.role]);

  useEffect(() => {
    if (session?.user?.role === "admin") refreshAdminData();
  }, [session]);

  async function refreshPublicData() {
    try {
      const serverHalls = await api("/halls");
      setHalls(serverHalls);
      if (serverHalls[0] && !serverHalls.some((hall) => hall.id === selectedHall)) setSelectedHall(serverHalls[0].id);
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function refreshAdminData() {
    try {
      const [serverBookings, adminOverview, serverSupportMessages] = await Promise.all([
        api("/bookings"),
        api("/admin/overview"),
        api("/support")
      ]);
      setBookings(serverBookings);
      setOverview(adminOverview);
      setSupportMessages(serverSupportMessages);
    } catch (error) {
      setNotice(error.message);
    }
  }

  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      const matchesQuery = `${hall.name} ${hall.location} ${(hall.features || []).join(" ")}`.toLowerCase().includes(query.toLowerCase());
      const matchesCapacity =
        capacity === "all" ||
        (capacity === "small" && hall.capacity <= 180) ||
        (capacity === "mid" && hall.capacity > 180 && hall.capacity <= 400) ||
        (capacity === "large" && hall.capacity > 400);
      return matchesQuery && matchesCapacity;
    });
  }, [halls, query, capacity]);

  const activeHall = halls.find((hall) => hall.id === selectedHall) || halls[0] || fallbackHalls[0];
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);

  const login = async (credentials) => {
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
    localStorage.setItem("elite-token", data.token);
    localStorage.setItem("elite-session", JSON.stringify({ user: data.user }));
    setSession({ user: data.user });
    setNotice(`Logged in as ${data.user.role}`);
    if (data.user.role === "admin") navigate("/admin");
  };

  const logout = () => {
    localStorage.removeItem("elite-token");
    localStorage.removeItem("elite-session");
    setSession(null);
    setBookings([]);
    setOverview(null);
    setNotice("Logged out");
    navigate("/");
  };

  const navigate = (target) => {
    window.history.pushState({}, "", target);
    setPath(window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleService = (service) => {
    setForm((current) => ({
      ...current,
      services: current.services.includes(service) ? current.services.filter((item) => item !== service) : [...current.services, service]
    }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        customerName: form.name,
        customerEmail: form.email,
        phone: form.phone,
        hallId: activeHall.id,
        date: form.date,
        time: form.time,
        eventType: form.eventType,
        guests: Number(form.guests),
        services: form.services,
        notes: form.notes
      };
      const created = await api("/bookings", { method: "POST", body: JSON.stringify(payload) });
      await api("/payments/intent", { method: "POST", body: JSON.stringify({ bookingId: created.booking.id }) });
      const paid = await api("/payments/confirm", { method: "POST", body: JSON.stringify({ bookingId: created.booking.id }) });
      setConfirmation({ ...paid.booking, receiptUrl: `${API_URL}${paid.receiptUrl}` });
      setNotice(`Booking ${created.booking.id} confirmed and payment marked paid`);
      refreshPublicData();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const updateBooking = async (id, status) => {
    try {
      await api(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      refreshAdminData();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const addHall = async (hall) => {
    try {
      await api("/halls", { method: "POST", body: JSON.stringify(hall) });
      refreshPublicData();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const deleteHall = async (id) => {
    try {
      await api(`/halls/${id}`, { method: "DELETE" });
      refreshPublicData();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const sendSupportMessage = async (message) => {
    const supportMessage = await api("/support", { method: "POST", body: JSON.stringify(message) });
    setSupportMessages((current) => [supportMessage, ...current]);
    return supportMessage;
  };

  const resolveSupportMessage = async (id) => {
    try {
      await api(`/support/${id}/resolve`, { method: "PATCH" });
      refreshAdminData();
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-pearl text-ink transition-colors duration-500 dark:bg-ink dark:text-pearl">
      <Nav dark={dark} setDark={setDark} menuOpen={menuOpen} setMenuOpen={setMenuOpen} session={session} logout={logout} navigate={navigate} path={path} />
      <LiveNotice notice={notice} />
      {path === "/admin" ? (
        <main>
          <AdminGate session={session} login={login} logout={logout} bookings={bookings} totalRevenue={totalRevenue} overview={overview} updateBooking={updateBooking} halls={halls} addHall={addHall} deleteHall={deleteHall} supportMessages={supportMessages} resolveSupportMessage={resolveSupportMessage} />
        </main>
      ) : (
        <main>
          <Hero />
          <Venues filteredHalls={filteredHalls} query={query} setQuery={setQuery} capacity={capacity} setCapacity={setCapacity} setSelectedHall={setSelectedHall} />
          <Booking form={form} setForm={setForm} activeHall={activeHall} halls={halls} selectedHall={selectedHall} setSelectedHall={setSelectedHall} toggleService={toggleService} submitBooking={submitBooking} confirmation={confirmation} />
          <CalendarView halls={halls} />
          <Gallery />
          <Pricing />
          <Testimonials />
          <Contact />
        </main>
      )}
      {path !== "/admin" && <SupportWidget sendSupportMessage={sendSupportMessage} />}
      <Footer />
    </div>
  );
}

function LiveNotice({ notice }) {
  return <div className="fixed bottom-5 left-5 z-50 rounded-full border border-white/15 bg-ink/85 px-4 py-2 text-xs font-semibold text-white shadow-glow backdrop-blur">{notice}</div>;
}

function Nav({ dark, setDark, menuOpen, setMenuOpen, session, logout, navigate, path }) {
  const links = ["Home", "Venues", "Booking", "Gallery", "Pricing", "About", "Contact"];
  const goHome = (hash = "") => {
    if (path !== "/") navigate(`/${hash}`);
  };
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/70 text-white backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/#home" onClick={(event) => { event.preventDefault(); navigate("/#home"); }} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-champagne text-ink shadow-glow"><Sparkles size={19} /></span>
          <span className="font-display text-xl font-semibold">Elite Event Hub</span>
        </a>
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => <a className="text-sm text-white/78 transition hover:text-champagne" href={`/#${link.toLowerCase()}`} onClick={() => goHome(`#${link.toLowerCase()}`)} key={link}>{link}</a>)}
          {session?.user?.role === "admin" && <a className="text-sm text-champagne transition hover:text-white" href="/admin" onClick={(event) => { event.preventDefault(); navigate("/admin"); }}>Dashboard</a>}
        </div>
        <div className="flex items-center gap-2">
          <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          {session?.user?.role === "admin" && <button onClick={logout} className="hidden rounded-full border border-white/20 px-4 py-2 text-sm sm:inline-flex">Logout</button>}
          <a href="/#booking" onClick={() => goHome("#booking")} className="hidden rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-ink shadow-glow transition hover:scale-[1.02] sm:inline-flex">Reserve</a>
          <button className="icon-button lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </nav>
      {menuOpen && (
        <div className="border-t border-white/10 bg-ink px-4 py-4 lg:hidden">
          {links.map((link) => <a className="block rounded-lg px-3 py-3 text-white/80 hover:bg-white/10" href={`/#${link.toLowerCase()}`} key={link} onClick={() => { goHome(`#${link.toLowerCase()}`); setMenuOpen(false); }}>{link}</a>)}
          {session?.user?.role === "admin" && <a className="block rounded-lg px-3 py-3 text-champagne hover:bg-white/10" href="/admin" onClick={(event) => { event.preventDefault(); navigate("/admin"); setMenuOpen(false); }}>Dashboard</a>}
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-24">
      <div className="absolute inset-0">
        <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1900&q=90" alt="Luxury decorated event hall" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/20" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />
      </div>
      <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_.75fr] lg:px-8">
        <div className="max-w-3xl animate-reveal text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur"><BadgeCheck size={16} className="text-champagne" /> Real-time venues, secure admin, instant receipts</span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">Book unforgettable halls with a concierge-grade experience.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">Search live availability, reserve a hall, simulate payment, download a receipt, and let admins approve reservations from a protected dashboard.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#venues" className="inline-flex items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3 font-semibold text-ink shadow-glow transition hover:translate-y-[-2px]">Explore venues <ArrowRight size={18} /></a>
            <a href="#booking" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/18">Start booking</a>
          </div>
        </div>
        <div className="animate-float rounded-[2rem] border border-white/16 bg-white/12 p-5 text-white shadow-glow backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-3 text-center">{[["Live", "Sync"], ["JWT", "Admin"], ["PDF", "Ready"]].map(([value, label]) => <div className="rounded-2xl bg-white/14 p-4" key={label}><div className="font-display text-2xl font-semibold text-champagne">{value}</div><div className="mt-1 text-xs text-white/82">{label}</div></div>)}</div>
          <div className="mt-4 rounded-2xl bg-ink/65 p-4"><p className="text-sm text-white/82">Private operations</p><p className="mt-3 font-display text-2xl">Admin tools are separated</p><p className="mt-1 text-sm text-white/84">Only authenticated admins can open the dashboard.</p></div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, body, light = false }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${light ? "text-champagne" : "text-bronze"}`}>{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{title}</h2>
      {body && <p className={`mt-4 text-base leading-7 ${light ? "text-white/82" : "text-ink/78 dark:text-pearl/82"}`}>{body}</p>}
    </div>
  );
}

function Venues({ filteredHalls, query, setQuery, capacity, setCapacity, setSelectedHall }) {
  return (
    <section id="venues" className="section">
      <SectionTitle eyebrow="Venues" title="Live halls for every signature moment" body="Search by location, features, or size. Availability updates when bookings are created." />
      <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-3 rounded-2xl border border-ink/10 bg-white/75 p-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/8 sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-xl bg-ink/5 px-4 py-3 dark:bg-white/8"><Search size={18} className="text-bronze" /><input className="w-full bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search halls, location, services" /></label>
        <label className="flex items-center gap-3 rounded-xl bg-ink/5 px-4 py-3 dark:bg-white/8"><Filter size={18} className="text-bronze" /><select className="bg-transparent outline-none" value={capacity} onChange={(event) => setCapacity(event.target.value)}><option value="all">All capacity</option><option value="small">Up to 180</option><option value="mid">181 - 400</option><option value="large">400+</option></select></label>
      </div>
      <div className="mx-auto mt-8 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        {filteredHalls.map((hall) => <VenueCard hall={hall} key={hall.id} setSelectedHall={setSelectedHall} />)}
      </div>
    </section>
  );
}

function VenueCard({ hall, setSelectedHall }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-white/8">
      <div className="relative h-56 overflow-hidden"><img className="h-full w-full object-cover transition duration-700 group-hover:scale-110" src={hall.imageUrl} alt={hall.name} /><span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{hall.availabilityStatus}</span></div>
      <div className="p-5">
        <h3 className="font-display text-2xl font-semibold">{hall.name}</h3>
        <div className="mt-3 space-y-2 text-sm text-ink/78 dark:text-pearl/84"><p className="flex items-center gap-2"><Users size={16} /> {hall.capacity} guests</p><p className="flex items-center gap-2"><MapPin size={16} /> {hall.location}</p><p className="font-semibold text-bronze">{money(hall.pricePerDay)} / day</p></div>
        <div className="mt-4 flex flex-wrap gap-2">{(hall.features || []).map((feature) => <span className="rounded-full bg-bronze/10 px-3 py-1 text-xs text-bronze" key={feature}>{feature}</span>)}</div>
        <a href="#booking" onClick={() => setSelectedHall(hall.id)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-bronze dark:bg-champagne dark:text-ink">Book Now <ArrowRight size={16} /></a>
      </div>
    </article>
  );
}

function Booking({ form, setForm, activeHall, halls, selectedHall, setSelectedHall, toggleService, submitBooking, confirmation }) {
  const services = ["Catering", "Decoration", "Security", "Photography", "Live stream", "Valet parking"];
  const selectedDateBooked = activeHall.bookedDates?.includes(form.date);
  return (
    <section id="booking" className="section bg-ink text-white">
      <SectionTitle light eyebrow="Booking" title="Reserve, pay, and receive confirmation" body="This form posts to the backend, updates availability in real time, creates a demo payment, and unlocks a receipt download." />
      <div className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_.78fr] lg:px-8">
        <form onSubmit={submitBooking} className="rounded-2xl border border-white/10 bg-white/8 p-5 shadow-glow backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Your name" icon={<User size={16} />} required />
            <Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="you@example.com" icon={<Mail size={16} />} required />
            <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} placeholder="+234..." icon={<Phone size={16} />} />
            <label className="field"><span>Event hall</span><select value={selectedHall} onChange={(event) => setSelectedHall(event.target.value)}>{halls.map((hall) => <option value={hall.id} key={hall.id}>{hall.name}</option>)}</select></label>
            <Field label="Date" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} icon={<CalendarDays size={16} />} required />
            <Field label="Time" type="time" value={form.time} onChange={(value) => setForm({ ...form, time: value })} icon={<Clock size={16} />} required />
            <Field label="Event type" value={form.eventType} onChange={(value) => setForm({ ...form, eventType: value })} placeholder="Wedding, conference..." required />
            <Field label="Guests" type="number" value={form.guests} onChange={(value) => setForm({ ...form, guests: value })} required />
          </div>
          {selectedDateBooked && <p className="mt-4 rounded-xl bg-wine/25 p-3 text-sm text-white">That date is already booked for this hall. Pick another date.</p>}
          <div className="mt-5"><span className="text-sm font-semibold text-white/90">Services</span><div className="mt-3 grid gap-2 sm:grid-cols-3">{services.map((service) => <button type="button" key={service} onClick={() => toggleService(service)} className={`rounded-xl border px-4 py-3 text-left text-sm transition ${form.services.includes(service) ? "border-champagne bg-champagne text-ink" : "border-white/20 bg-white/10 text-white/90 hover:bg-white/16"}`}>{service}</button>)}</div></div>
          <label className="field mt-5"><span>Event details</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows="4" placeholder="Tell us about seating, styling, catering, and special requests." /></label>
          <button disabled={selectedDateBooked} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-champagne px-5 py-3 font-semibold text-ink transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"><CreditCard size={18} /> Book and pay now</button>
        </form>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-white/14 bg-white/10 p-5 backdrop-blur"><img className="h-52 w-full rounded-xl object-cover" src={activeHall.imageUrl} alt={activeHall.name} /><h3 className="mt-4 font-display text-3xl font-semibold">{activeHall.name}</h3><p className="mt-2 text-white/86">{activeHall.location}</p><div className="mt-4 flex items-center justify-between rounded-xl bg-white/12 p-4"><span>Total today</span><strong className="text-champagne">{money(activeHall.pricePerDay)}</strong></div><div className="mt-4 flex flex-wrap gap-2">{(activeHall.features || []).map((feature) => <span className="rounded-full bg-white/14 px-3 py-1 text-xs text-white/90" key={feature}>{feature}</span>)}</div></div>
          {confirmation && <div className="rounded-2xl border border-sage/40 bg-sage/25 p-5"><div className="flex items-center gap-3 text-white"><ShieldCheck className="text-sage" /> Booking confirmed</div><p className="mt-3 text-sm text-white/90">Reservation {confirmation.id} is paid and queued for admin approval, reminders, and email confirmation.</p><a className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink" href={confirmation.receiptUrl}><Download size={16} /> Download receipt</a></div>}
        </aside>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", icon, required = false }) {
  return <label className="field"><span>{label}</span><div className="input-wrap">{icon}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></div></label>;
}

function CalendarView({ halls }) {
  const bookedDays = new Set(halls.flatMap((hall) => (hall.bookedDates || []).filter((date) => date.startsWith("2026-06")).map((date) => Number(date.slice(-2)))));
  return (
    <section className="section">
      <SectionTitle eyebrow="Calendar" title="Booked-date visibility" body="The calendar reflects live booked dates from the hall data." />
      <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-ink/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/8">
        <div className="mb-5 flex items-center justify-between"><h3 className="font-display text-2xl font-semibold">June 2026</h3><div className="flex gap-3 text-sm"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-wine" />Booked</span><span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-sage" />Open</span></div></div>
        <div className="grid grid-cols-7 gap-2">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div className="py-2 text-center text-xs font-semibold text-ink/50 dark:text-pearl/50" key={day}>{day}</div>)}{Array.from({ length: 35 }, (_, index) => index + 1).map((date) => <div className={`calendar-cell ${bookedDays.has(date) ? "booked" : "open"}`} key={date}>{date <= 30 ? date : ""}</div>)}</div>
      </div>
    </section>
  );
}

function Gallery() {
  return <section id="gallery" className="section bg-white dark:bg-white/5"><SectionTitle eyebrow="Gallery" title="Cinematic spaces, real event energy" /><div className="mx-auto mt-10 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">{gallery.map((src, index) => <img className={`h-72 w-full rounded-2xl object-cover shadow-soft ${index === 1 || index === 4 ? "lg:translate-y-8" : ""}`} src={src} alt={`Elite Event Hub gallery ${index + 1}`} key={src} />)}</div></section>;
}

function Pricing() {
  return <section id="pricing" className="section"><SectionTitle eyebrow="Pricing" title="Packages for every event type" /><div className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">{packages.map(([name, body, price, perks]) => <article className="rounded-2xl border border-ink/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10" key={name}><h3 className="font-display text-2xl font-semibold">{name}</h3><p className="mt-3 text-sm leading-6 text-ink/78 dark:text-pearl/84">{body}</p><p className="mt-5 text-2xl font-bold text-bronze">{money(price)}</p><div className="mt-5 space-y-3">{perks.map((perk) => <p className="flex items-center gap-2 text-sm text-ink/82 dark:text-pearl/88" key={perk}><Check size={16} className="text-sage" />{perk}</p>)}</div></article>)}</div></section>;
}

function Testimonials() {
  return <section id="about" className="section bg-ink text-white"><SectionTitle light eyebrow="Reviews" title="Trusted by hosts, planners, and teams" /><div className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">{reviews.map(([quote, name, role]) => <figure className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur" key={name}><div className="flex gap-1 text-champagne">{Array.from({ length: 5 }).map((_, index) => <Star fill="currentColor" size={16} key={index} />)}</div><blockquote className="mt-5 leading-7 text-white/88">"{quote}"</blockquote><figcaption className="mt-5 font-semibold">{name}<span className="block text-sm font-normal text-white/72">{role}</span></figcaption></figure>)}</div></section>;
}

function AdminGate({ session, login, logout, bookings, totalRevenue, overview, updateBooking, halls, addHall, deleteHall, supportMessages, resolveSupportMessage }) {
  if (session?.user?.role === "admin") return <AdminDashboard session={session} logout={logout} bookings={bookings} totalRevenue={totalRevenue} overview={overview} updateBooking={updateBooking} halls={halls} addHall={addHall} deleteHall={deleteHall} supportMessages={supportMessages} resolveSupportMessage={resolveSupportMessage} />;
  return <AdminLogin login={login} session={session} />;
}

function AdminLogin({ login, session }) {
  const [email, setEmail] = useState("admin@eliteeventhub.com");
  const [password, setPassword] = useState("AdminPass123");
  const [error, setError] = useState("");
  return (
    <section id="admin" className="section bg-white dark:bg-white/5">
      <SectionTitle eyebrow="Secure Admin" title="Dashboard requires admin login" body="The admin area is no longer public. JWT authentication and role checks protect both the UI and backend APIs." />
      <form onSubmit={async (event) => { event.preventDefault(); setError(""); try { await login({ email, password }); } catch (err) { setError(err.message); } }} className="mx-auto mt-10 max-w-xl rounded-2xl border border-ink/10 bg-pearl p-6 shadow-soft dark:border-white/10 dark:bg-ink">
        {session && session.user.role !== "admin" && <p className="mb-4 rounded-xl bg-wine/15 p-3 text-sm text-wine">You are logged in as a user. Admin role is required.</p>}
        <div className="grid gap-4"><Field label="Admin email" value={email} onChange={setEmail} icon={<Mail size={16} />} required /><Field label="Password" value={password} onChange={setPassword} type="password" icon={<Lock size={16} />} required /><button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white dark:bg-champagne dark:text-ink">Unlock dashboard</button>{error && <p className="text-sm text-wine">{error}</p>}</div>
      </form>
    </section>
  );
}

function AdminDashboard({ session, logout, bookings, totalRevenue, overview, updateBooking, halls, addHall, deleteHall, supportMessages, resolveSupportMessage }) {
  const [draftHall, setDraftHall] = useState({ name: "", capacity: 100, pricePerDay: 500000, location: "", features: "AC, Parking, WiFi", imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85", availabilityStatus: "Available" });
  return (
    <section id="admin" className="section">
      <SectionTitle eyebrow="Admin" title="Protected operations dashboard" body={`Signed in as ${session.user.email}. Manage bookings, halls, approvals, payments, alerts, and revenue from a secured console.`} />
      <div className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><Metric icon={<BarChart3 />} label="Revenue" value={money(overview?.metrics?.revenue || totalRevenue)} /><Metric icon={<CalendarDays />} label="Bookings" value={overview?.metrics?.bookings || bookings.length} /><Metric icon={<Bell />} label="Open support" value={overview?.metrics?.openSupport || supportMessages.filter((item) => item.status === "Open").length} /><Metric icon={<Wifi />} label="Live support" value="Online" /><button onClick={logout} className="rounded-xl border border-ink/10 bg-white px-4 py-3 font-semibold shadow-soft dark:border-white/10 dark:bg-white/8">Logout admin</button></div>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/8">
            <div className="flex items-center justify-between border-b border-ink/10 p-5 dark:border-white/10"><div className="flex items-center gap-3"><LayoutDashboard className="text-bronze" /><h3 className="font-display text-2xl font-semibold">Reservations</h3></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-ink/5 text-ink/72 dark:bg-white/10 dark:text-pearl/82"><tr><th className="p-4">Booking</th><th className="p-4">Customer</th><th className="p-4">Event</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{bookings.map((booking) => <tr className="border-t border-ink/8 dark:border-white/8" key={booking.id}><td className="p-4 font-semibold">{booking.id}<span className="block text-xs font-normal text-ink/66 dark:text-pearl/70">{booking.date} {booking.time}</span></td><td className="p-4">{booking.customerName}<span className="block text-xs text-ink/66 dark:text-pearl/70">{booking.customerEmail}</span></td><td className="p-4">{booking.eventType}</td><td className="p-4">{booking.paymentStatus}</td><td className="p-4"><span className="rounded-full bg-bronze/12 px-3 py-1 text-xs font-semibold text-bronze">{booking.status}</span></td><td className="p-4"><div className="flex gap-2"><button onClick={() => updateBooking(booking.id, "Approved")} className="rounded-lg bg-sage px-3 py-2 text-xs font-semibold text-white">Approve</button><button onClick={() => updateBooking(booking.id, "Rejected")} className="rounded-lg bg-wine px-3 py-2 text-xs font-semibold text-white">Reject</button></div></td></tr>)}</tbody></table></div>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/8">
            <h3 className="font-display text-2xl font-semibold">Hall manager</h3>
            <form onSubmit={(event) => { event.preventDefault(); addHall({ ...draftHall, capacity: Number(draftHall.capacity), pricePerDay: Number(draftHall.pricePerDay), features: draftHall.features.split(",").map((item) => item.trim()).filter(Boolean) }); setDraftHall({ ...draftHall, name: "", location: "" }); }} className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Hall name" value={draftHall.name} onChange={(value) => setDraftHall({ ...draftHall, name: value })} required />
              <Field label="Location" value={draftHall.location} onChange={(value) => setDraftHall({ ...draftHall, location: value })} required />
              <Field label="Capacity" type="number" value={draftHall.capacity} onChange={(value) => setDraftHall({ ...draftHall, capacity: value })} required />
              <Field label="Price per day" type="number" value={draftHall.pricePerDay} onChange={(value) => setDraftHall({ ...draftHall, pricePerDay: value })} required />
              <label className="field sm:col-span-2"><span>Features</span><input value={draftHall.features} onChange={(event) => setDraftHall({ ...draftHall, features: event.target.value })} /></label>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-bronze px-4 py-3 font-semibold text-white sm:col-span-2"><Plus size={17} /> Add hall</button>
            </form>
            <div className="mt-5 grid gap-3">{halls.map((hall) => <div className="flex items-center justify-between rounded-xl bg-ink/5 p-3 dark:bg-white/8" key={hall.id}><span>{hall.name}<small className="block text-ink/50 dark:text-pearl/50">{money(hall.pricePerDay)} · {hall.capacity} guests</small></span><button onClick={() => deleteHall(hall.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-wine text-white" aria-label="Delete hall"><Trash2 size={15} /></button></div>)}</div>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl font-semibold">Support inbox</h3>
              <span className="rounded-full bg-bronze/12 px-3 py-1 text-xs font-semibold text-bronze">{supportMessages.filter((item) => item.status === "Open").length} open</span>
            </div>
            <div className="mt-5 grid gap-3">
              {supportMessages.length === 0 && <p className="rounded-xl bg-ink/5 p-4 text-sm text-ink/72 dark:bg-white/10 dark:text-pearl/82">No support messages yet.</p>}
              {supportMessages.slice(0, 6).map((item) => (
                <div className="rounded-xl border border-ink/10 bg-ink/[0.03] p-4 dark:border-white/10 dark:bg-white/8" key={item.id}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <p className="font-semibold">{item.name || "Guest"} <span className="text-sm font-normal text-ink/64 dark:text-pearl/72">{item.email}</span></p>
                      <p className="mt-2 text-sm leading-6 text-ink/78 dark:text-pearl/84">{item.message}</p>
                      <p className="mt-2 rounded-lg bg-sage/12 p-3 text-sm text-ink/78 dark:text-pearl/84">Auto reply: {item.reply}</p>
                    </div>
                    <button onClick={() => resolveSupportMessage(item.id)} disabled={item.status === "Resolved"} className="h-fit rounded-lg bg-sage px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                      {item.status === "Resolved" ? "Resolved" : "Resolve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }) {
  return <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/10"><div className="text-bronze">{icon}</div><p className="mt-5 text-sm font-semibold text-ink/72 dark:text-pearl/80">{label}</p><p className="mt-1 font-display text-3xl font-semibold">{value}</p></div>;
}

function Contact() {
  return (
    <section id="contact" className="section">
      <SectionTitle eyebrow="Contact" title="Plan your next elite event" />
      <div className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/10"><div className="grid gap-4"><Field label="Name" value="" onChange={() => {}} placeholder="Your name" /><Field label="Email" value="" onChange={() => {}} placeholder="you@example.com" /><label className="field"><span>Message</span><textarea rows="5" placeholder="Tell us what you want to host." /></label><button className="rounded-xl bg-bronze px-5 py-3 font-semibold text-white">Send message</button></div><div className="mt-6 grid gap-3 text-sm text-ink/78 dark:text-pearl/84"><p className="flex items-center gap-2"><Phone size={16} /> +234 800 555 0199</p><p className="flex items-center gap-2"><Mail size={16} /> bookings@eliteeventhub.com</p><p className="flex items-center gap-2"><MapPin size={16} /> 21 Admiralty Way, Lekki, Lagos</p></div></div>
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/8"><iframe title="Elite Event Hub map" className="h-full min-h-[420px] w-full" loading="lazy" src="https://www.google.com/maps?q=Lekki%20Phase%201%20Lagos&output=embed" /></div>
      </div>
    </section>
  );
}

function SupportWidget({ sendSupportMessage }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState([
    { from: "support", text: "Welcome to Elite Event Hub. Ask about halls, pricing, dates, payment, or receipts." }
  ]);
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const userText = message.trim();
    setThread((current) => [...current, { from: "you", text: userText }]);
    setMessage("");
    setSending(true);
    try {
      const response = await sendSupportMessage({ name, email, message: userText });
      setThread((current) => [...current, { from: "support", text: response.reply }]);
    } catch (error) {
      setThread((current) => [...current, { from: "support", text: error.message || "Support is temporarily unavailable." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2rem)] max-w-sm text-white">
      {open && (
        <div className="mb-3 overflow-hidden rounded-2xl border border-white/18 bg-ink shadow-glow">
          <div className="flex items-center justify-between bg-white/8 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-champagne text-ink"><Headphones size={19} /></span>
              <div><p className="font-semibold">Live support</p><p className="text-xs text-white/76">Connected to admin inbox</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10" aria-label="Close support"><X size={16} /></button>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto p-4">
            {thread.map((item, index) => (
              <div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${item.from === "you" ? "ml-8 bg-champagne text-ink" : "mr-8 bg-white/10 text-white/90"}`} key={`${item.from}-${index}`}>
                {item.text}
              </div>
            ))}
          </div>
          <form onSubmit={submit} className="grid gap-2 border-t border-white/10 p-4">
            <div className="grid grid-cols-2 gap-2">
              <input className="support-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
              <input className="support-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
            </div>
            <div className="flex gap-2">
              <input className="support-input" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your question..." />
              <button disabled={sending} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-champagne text-ink disabled:opacity-60" aria-label="Send support message">
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="ml-auto flex items-center gap-3 rounded-full bg-champagne px-5 py-3 font-semibold text-ink shadow-glow">
        <Headphones size={18} /> {open ? "Close chat" : "Chat with us"}
      </button>
    </div>
  );
}

function Footer() {
  return <footer className="border-t border-ink/10 px-4 py-8 text-center text-sm text-ink/72 dark:border-white/10 dark:text-pearl/78"><p>Elite Event Hub © 2026. Premium booking, secure payments, automated confirmations, and admin operations.</p></footer>;
}

createRoot(document.getElementById("root")).render(<App />);
