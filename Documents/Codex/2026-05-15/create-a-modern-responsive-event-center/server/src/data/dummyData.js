export const halls = [
  {
    id: "grand-aurora",
    name: "Grand Aurora Ballroom",
    capacity: 650,
    pricePerDay: 1800000,
    location: "Victoria Island, Lagos",
    availabilityStatus: "Available",
    features: ["AC", "Valet parking", "Grand stage", "Catering", "Decoration", "WiFi"],
    bookedDates: ["2026-05-22", "2026-06-06", "2026-06-21"],
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "opal-garden",
    name: "Opal Garden Pavilion",
    capacity: 320,
    pricePerDay: 950000,
    location: "Lekki Phase 1, Lagos",
    availabilityStatus: "Few slots",
    features: ["Outdoor lawn", "Lighting", "Catering", "Bridal suite", "WiFi"],
    bookedDates: ["2026-05-19", "2026-06-02", "2026-06-14"],
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "summit-hall",
    name: "Summit Conference Hall",
    capacity: 220,
    pricePerDay: 700000,
    location: "Ikeja GRA, Lagos",
    availabilityStatus: "Available",
    features: ["Projector", "Hybrid meeting kit", "Stage", "Coffee bar", "WiFi"],
    bookedDates: ["2026-05-24", "2026-06-10"],
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85"
  }
];

export const bookings = [
  {
    id: "BK-1024",
    customerName: "Amara Okafor",
    customerEmail: "amara@example.com",
    hallId: "grand-aurora",
    eventType: "Wedding",
    date: "2026-05-22",
    time: "17:00",
    services: ["Catering", "Decoration", "Security"],
    amount: 1800000,
    status: "Approved",
    paymentStatus: "Paid"
  },
  {
    id: "BK-1025",
    customerName: "Kola Martins",
    customerEmail: "kola@example.com",
    hallId: "summit-hall",
    eventType: "Conference",
    date: "2026-05-24",
    time: "09:00",
    services: ["Live stream", "Coffee bar"],
    amount: 700000,
    status: "Pending",
    paymentStatus: "Awaiting"
  }
];

export const users = [
  {
    id: "USR-1",
    name: "Platform Admin",
    email: "admin@eliteeventhub.com",
    password: "AdminPass123",
    role: "admin"
  },
  {
    id: "USR-2",
    name: "Guest User",
    email: "guest@eliteeventhub.com",
    password: "GuestPass123",
    role: "user"
  }
];
