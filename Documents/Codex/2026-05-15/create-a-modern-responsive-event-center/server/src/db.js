import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { bookings as seedBookings, halls as seedHalls, users as seedUsers } from "./data/dummyData.js";
import { Booking } from "./models/Booking.js";
import { Hall } from "./models/Hall.js";
import { User } from "./models/User.js";

export const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/elite-event-hub";

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function connectDatabase() {
  await mongoose.connect(mongoUri);
  await seedDatabase();
}

async function seedDatabase() {
  const hallsWithoutSlug = await Hall.find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }]
  });

  for (const hall of hallsWithoutSlug) {
    const seed = seedHalls.find((entry) => entry.name === hall.name) || seedHalls.find((entry) => entry.id === slugify(hall.name));
    hall.slug = seed?.id || slugify(hall.name);
    hall.capacity = hall.capacity || seed?.capacity || 100;
    hall.pricePerDay = hall.pricePerDay || seed?.pricePerDay || 500000;
    hall.location = hall.location || seed?.location || "Lagos";
    hall.features = hall.features?.length ? hall.features : seed?.features || ["AC", "Parking", "WiFi"];
    hall.bookedDates = hall.bookedDates?.length ? hall.bookedDates : seed?.bookedDates || [];
    hall.imageUrl = hall.imageUrl || seed?.imageUrl;
    hall.availabilityStatus = hall.availabilityStatus || seed?.availabilityStatus || "Available";
    await hall.save();
  }

  for (const hall of seedHalls) {
    await Hall.findOneAndUpdate(
      { $or: [{ slug: hall.id }, { name: hall.name }] },
      {
        $set: {
          slug: hall.id || slugify(hall.name),
          name: hall.name,
          capacity: hall.capacity,
          pricePerDay: hall.pricePerDay,
          location: hall.location,
          availabilityStatus: hall.availabilityStatus,
          features: hall.features,
          imageUrl: hall.imageUrl
        },
        $addToSet: { bookedDates: { $each: hall.bookedDates || [] } }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const user of seedUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const existing = await User.findOne({ email: user.email });

    if (!existing) {
      await User.create({
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role
      });
    } else if (!existing.passwordHash) {
      existing.passwordHash = passwordHash;
      existing.name = existing.name || user.name;
      existing.role = existing.role || user.role;
      await existing.save();
    }
  }

  for (const booking of seedBookings) {
    await Booking.findOneAndUpdate(
      { id: booking.id },
      { $setOnInsert: booking },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}
