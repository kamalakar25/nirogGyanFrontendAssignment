const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const dbFile = process.env.DB_FILE || "./niroggyan.db";
let dbInstance = null;

// Initialize SQLite database with connection pooling
async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbFile,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    });

    // Enable WAL mode for better concurrent access
    await dbInstance.exec("PRAGMA journal_mode = WAL;");
    await dbInstance.exec("PRAGMA synchronous = NORMAL;");
    await dbInstance.exec("PRAGMA cache_size = 1000;");
    await dbInstance.exec("PRAGMA temp_store = memory;");
  }
  return dbInstance;
}

// Stricter rate limiter for debugging with IPv6-safe key generator
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20, // Limit each IP to 20 requests per minute
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP ${req.ip} on ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
});

app.use(limiter);

// Initialize database tables
async function initializeDatabase() {
  const db = await getDatabase();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      image TEXT,
      rating REAL CHECK(rating >= 0 AND rating <= 5),
      experience INTEGER CHECK(experience >= 0),
      availabilityStatus TEXT CHECK(availabilityStatus IN ('available', 'busy', 'unavailable')),
      consultationFee INTEGER CHECK(consultationFee >= 0),
      location TEXT,
      about TEXT,
      education TEXT,
      languages TEXT,
      availableSlots TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctorId TEXT,
      doctorName TEXT,
      patientName TEXT NOT NULL,
      patientEmail TEXT NOT NULL CHECK(patientEmail LIKE '%_@__%.__%'),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      consultationFee INTEGER CHECK(consultationFee >= 0),
      status TEXT CHECK(status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'confirmed',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctorId) REFERENCES doctors(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      totalAppointments INTEGER DEFAULT 0 CHECK(totalAppointments >= 0),
      totalDoctors INTEGER DEFAULT 0 CHECK(totalDoctors >= 0),
      totalPatients INTEGER DEFAULT 0 CHECK(totalPatients >= 0),
      monthlyRevenue REAL DEFAULT 0 CHECK(monthlyRevenue >= 0),
      lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patientEmail);
    CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctorId);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
    CREATE INDEX IF NOT EXISTS idx_doctors_availability ON doctors(availabilityStatus);
  `);

  // Initialize analytics if not exists
  const analyticsCount = await db.get(
    "SELECT COUNT(*) as count FROM analytics"
  );
  if (analyticsCount.count === 0) {
    await db.run(`
      INSERT INTO analytics (totalAppointments, totalDoctors, totalPatients, monthlyRevenue, lastUpdated)
      VALUES (0, 0, 0, 0, datetime('now'))
    `);
  }

  // Initialize sample doctors if not exists
  const doctorsCount = await db.get("SELECT COUNT(*) as count FROM doctors");
  if (doctorsCount.count === 0) {
    const sampleDoctors = [
      {
        id: "1",
        name: "Dr. Kusuma",
        specialization: "Cardiologist",
        image:
          "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.9,
        experience: 12,
        availabilityStatus: "available",
        consultationFee: 1200,
        location: "Downtown Medical Center",
        about:
          "Dr. Kusuma is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases and preventive cardiology.",
        education: JSON.stringify([
          "MD - Harvard Medical School",
          "Residency - Johns Hopkins Hospital",
          "Fellowship - Mayo Clinic",
        ]),
        languages: JSON.stringify(["English", "Hindi"]),
        availableSlots: JSON.stringify([
          {
            date: "2025-08-10",
            slots: ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM"],
          },
          {
            date: "2025-08-11",
            slots: ["10:00 AM", "11:30 AM", "01:00 PM", "04:00 PM"],
          },
        ]),
      },
      {
        id: "2",
        name: "Dr. Rajesh Kumar",
        specialization: "Dermatologist",
        image:
          "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.8,
        experience: 8,
        availabilityStatus: "available",
        consultationFee: 950,
        location: "Skin Care Clinic",
        about:
          "Dr. Rajesh Kumar is a renowned dermatologist specializing in medical and cosmetic dermatology with expertise in skin cancer detection.",
        education: JSON.stringify([
          "MD - AIIMS Delhi",
          "Residency - PGI Chandigarh",
          "Fellowship - Manipal Hospital",
        ]),
        languages: JSON.stringify(["English", "Hindi", "Tamil"]),
        availableSlots: JSON.stringify([
          {
            date: "2025-08-10",
            slots: ["08:00 AM", "11:00 AM", "01:30 PM", "04:00 PM"],
          },
        ]),
      },
      {
        id: "3",
        name: "Dr. Priya Sharma",
        specialization: "Pediatrician",
        image:
          "https://images.pexels.com/photos/5327920/pexels-photo-5327920.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.7,
        experience: 10,
        availabilityStatus: "available",
        consultationFee: 1000,
        location: "Child Care Hospital, Mumbai",
        about:
          "Dr. Priya Sharma specializes in pediatric care with a focus on neonatal health and childhood development disorders.",
        education: JSON.stringify([
          "MBBS - KEM Hospital, Mumbai",
          "DCH - Seth GS Medical College",
          "Fellowship - Apollo Hospitals",
        ]),
        languages: JSON.stringify(["English", "Hindi", "Marathi"]),
        availableSlots: JSON.stringify([
          { date: "2025-08-10", slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
          { date: "2025-08-11", slots: ["10:00 AM", "12:00 PM", "03:00 PM"] },
        ]),
      },
      {
        id: "4",
        name: "Dr. Ananya Gupta",
        specialization: "Neurologist",
        image:
          "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.8,
        experience: 15,
        availabilityStatus: "available",
        consultationFee: 1500,
        location: "Brain & Spine Clinic, Delhi",
        about:
          "Dr. Ananya Gupta is an expert in treating neurological disorders, including epilepsy, stroke, and Parkinson's disease, with a focus on patient-centric care.",
        education: JSON.stringify([
          "DM Neurology - AIIMS Delhi",
          "Residency - NIMHANS Bangalore",
          "Fellowship - Cleveland Clinic",
        ]),
        languages: JSON.stringify(["English", "Hindi", "Bengali"]),
        availableSlots: JSON.stringify([
          {
            date: "2025-08-10",
            slots: ["10:00 AM", "12:30 PM", "03:00 PM", "04:30 PM"],
          },
          {
            date: "2025-08-11",
            slots: ["09:30 AM", "11:00 AM", "02:00 PM"],
          },
        ]),
      },
      {
        id: "5",
        name: "Dr. Vikram Singh",
        specialization: "Orthopedic Surgeon",
        image:
          "https://images.pexels.com/photos/5327578/pexels-photo-5327578.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.9,
        experience: 11,
        availabilityStatus: "available",
        consultationFee: 1300,
        location: "Bone & Joint Hospital, Chennai",
        about:
          "Dr. Vikram Singh specializes in joint replacement surgeries and sports injuries, with extensive experience in minimally invasive procedures.",
        education: JSON.stringify([
          "MS Orthopedics - Christian Medical College, Vellore",
          "Residency - Apollo Hospitals",
          "Fellowship - Singapore General Hospital",
        ]),
        languages: JSON.stringify(["English", "Hindi", "Punjabi"]),
        availableSlots: JSON.stringify([
          {
            date: "2025-08-10",
            slots: ["08:30 AM", "10:00 AM", "01:00 PM", "03:30 PM"],
          },
          {
            date: "2025-08-12",
            slots: ["09:00 AM", "11:30 AM", "02:30 PM"],
          },
        ]),
      },
      {
        id: "6",
        name: "Dr. Meera Patel",
        specialization: "Gynecologist",
        image:
          "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.7,
        experience: 9,
        availabilityStatus: "available",
        consultationFee: 1100,
        location: "Women's Health Center, Bangalore",
        about:
          "Dr. Meera Patel is dedicated to women's health, with expertise in high-risk pregnancies, infertility treatments, and laparoscopic surgeries.",
        education: JSON.stringify([
          "MD Obstetrics & Gynecology - Manipal Hospital",
          "Residency - St. John's Medical College",
          "Fellowship - Fernandez Hospital",
        ]),
        languages: JSON.stringify(["English", "Hindi", "Kannada"]),
        availableSlots: JSON.stringify([
          {
            date: "2025-08-10",
            slots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:00 PM"],
          },
          {
            date: "2025-08-11",
            slots: ["10:30 AM", "01:00 PM", "03:30 PM"],
          },
        ]),
      },
    ];

    for (const doctor of sampleDoctors) {
      await db.run(
        `
        INSERT INTO doctors (id, name, specialization, image, rating, experience, availabilityStatus, consultationFee, location, about, education, languages, availableSlots, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `,
        [
          doctor.id,
          doctor.name,
          doctor.specialization,
          doctor.image,
          doctor.rating,
          doctor.experience,
          doctor.availabilityStatus,
          doctor.consultationFee,
          doctor.location,
          doctor.about,
          doctor.education,
          doctor.languages,
          doctor.availableSlots,
        ]
      );
    }

    // Update analytics with initial doctor count
    await updateAnalytics();
  }

  return db;
}

// Function to update analytics
async function updateAnalytics() {
  const db = await getDatabase();

  try {
    // Get current counts
    const appointmentCount = await db.get(
      'SELECT COUNT(*) as count FROM appointments WHERE status != "cancelled"'
    );
    const doctorCount = await db.get("SELECT COUNT(*) as count FROM doctors");
    const patientCount = await db.get(
      "SELECT COUNT(DISTINCT patientEmail) as count FROM appointments"
    );
    const revenue = await db.get(
      'SELECT COALESCE(SUM(consultationFee), 0) as total FROM appointments WHERE status = "confirmed" AND date >= date("now", "start of month")'
    );

    // Update analytics table
    await db.run(
      `
      UPDATE analytics SET 
        totalAppointments = ?,
        totalDoctors = ?,
        totalPatients = ?,
        monthlyRevenue = ?,
        lastUpdated = datetime('now')
      WHERE id = 1
    `,
      [
        appointmentCount.count,
        doctorCount.count,
        patientCount.count,
        revenue.total,
      ]
    );

    console.log("Analytics updated successfully");
  } catch (error) {
    console.error("Error updating analytics:", error);
  }
}

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
    });
  }
  next(err);
});

// API Routes
app.get("/api/doctors", async (req, res) => {
  try {
    const db = await getDatabase();
    const {
      search,
      specialization,
      availability,
      limit = 50,
      offset = 0,
    } = req.query;

    // Validate parameters
    if (
      availability &&
      !["available", "busy", "unavailable"].includes(availability)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status",
      });
    }

    let query = "SELECT * FROM doctors";
    let countQuery = "SELECT COUNT(*) as total FROM doctors";
    let params = [];
    const conditions = [];

    if (search) {
      conditions.push("(LOWER(name) LIKE ? OR LOWER(specialization) LIKE ?)");
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm);
    }
    if (specialization) {
      conditions.push("specialization = ?");
      params.push(specialization);
    }
    if (availability) {
      conditions.push("availabilityStatus = ?");
      params.push(availability);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    query += " ORDER BY rating DESC, name ASC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [doctors, total] = await Promise.all([
      db.all(query, params),
      db.get(countQuery, params.slice(0, -2)), // Remove limit and offset for count
    ]);

    res.json({
      success: true,
      data: doctors.map((doctor) => ({
        ...doctor,
        education: JSON.parse(doctor.education || "[]"),
        languages: JSON.parse(doctor.languages || "[]"),
        availableSlots: JSON.parse(doctor.availableSlots || "[]"),
      })),
      count: doctors.length,
      total: total.total,
      hasMore: parseInt(offset) + doctors.length < total.total,
    });
  } catch (error) {
    console.error(`Error in /api/doctors [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctors",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

app.get("/api/doctors/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const doctor = await db.get("SELECT * FROM doctors WHERE id = ?", [
      req.params.id,
    ]);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...doctor,
        education: JSON.parse(doctor.education || "[]"),
        languages: JSON.parse(doctor.languages || "[]"),
        availableSlots: JSON.parse(doctor.availableSlots || "[]"),
      },
    });
  } catch (error) {
    console.error(`Error in /api/doctors/:id [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctor",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

app.get("/api/specializations", async (req, res) => {
  try {
    const db = await getDatabase();
    const specializations = await db.all(
      "SELECT DISTINCT specialization, COUNT(*) as count FROM doctors GROUP BY specialization ORDER BY specialization"
    );

    res.json({
      success: true,
      data: specializations.map((s) => ({
        name: s.specialization,
        count: s.count,
      })),
    });
  } catch (error) {
    console.error(`Error in /api/specializations [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching specializations",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const db = await getDatabase();
    const { doctorId, patientName, patientEmail, date, time } = req.body;

    // Validation
    if (!doctorId || !patientName || !patientEmail || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    if (patientName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must be at least 2 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Date validation
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: "Please select a future date",
      });
    }

    await db.run("BEGIN TRANSACTION");

    try {
      const doctor = await db.get("SELECT * FROM doctors WHERE id = ?", [
        doctorId,
      ]);
      if (!doctor) {
        await db.run("ROLLBACK");
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      const doctorData = {
        ...doctor,
        availableSlots: JSON.parse(doctor.availableSlots || "[]"),
      };

      // Check if slot is available
      const dateSlot = doctorData.availableSlots.find(
        (slot) => slot.date === date
      );
      if (!dateSlot || !dateSlot.slots.includes(time)) {
        await db.run("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Selected time slot is not available",
        });
      }

      // Check for duplicate appointments
      const existingAppointment = await db.get(
        'SELECT id FROM appointments WHERE doctorId = ? AND date = ? AND time = ? AND status != "cancelled"',
        [doctorId, date, time]
      );

      if (existingAppointment) {
        await db.run("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "This time slot is already booked",
        });
      }

      const appointment = {
        id: uuidv4(),
        doctorId,
        doctorName: doctorData.name,
        patientName: patientName.trim(),
        patientEmail: patientEmail.toLowerCase().trim(),
        date,
        time,
        consultationFee: doctorData.consultationFee,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      // Insert appointment
      await db.run(
        `
        INSERT INTO appointments (id, doctorId, doctorName, patientName, patientEmail, date, time, consultationFee, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          appointment.id,
          appointment.doctorId,
          appointment.doctorName,
          appointment.patientName,
          appointment.patientEmail,
          appointment.date,
          appointment.time,
          appointment.consultationFee,
          appointment.status,
          appointment.createdAt,
        ]
      );

      // Update doctor's available slots
      dateSlot.slots = dateSlot.slots.filter((slot) => slot !== time);
      if (dateSlot.slots.length === 0) {
        doctorData.availableSlots = doctorData.availableSlots.filter(
          (slot) => slot.date !== date
        );
      }

      await db.run(
        'UPDATE doctors SET availableSlots = ?, updatedAt = datetime("now") WHERE id = ?',
        [JSON.stringify(doctorData.availableSlots), doctorId]
      );

      await db.run("COMMIT");

      // Update analytics asynchronously
      updateAnalytics().catch((err) =>
        console.error("Failed to update analytics:", err)
      );

      res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        data: appointment,
      });
    } catch (error) {
      await db.run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error(`Error in /api/appointments [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment. Please try again.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

app.get("/api/appointments", async (req, res) => {
  try {
    const db = await getDatabase();
    const { email, status, limit = 50, offset = 0 } = req.query;

    let query = "SELECT * FROM appointments";
    let countQuery = "SELECT COUNT(*) as total FROM appointments";
    let params = [];
    const conditions = [];

    if (email) {
      conditions.push("patientEmail = ?");
      params.push(email.toLowerCase().trim());
    }

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    query += " ORDER BY date DESC, time DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [appointments, total] = await Promise.all([
      db.all(query, params),
      db.get(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      success: true,
      data: appointments,
      count: appointments.length,
      total: total.total,
      hasMore: parseInt(offset) + appointments.length < total.total,
    });
  } catch (error) {
    console.error(`Error in /api/appointments [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

app.patch("/api/appointments/:id/cancel", async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run("BEGIN TRANSACTION");

    try {
      const appointment = await db.get(
        "SELECT * FROM appointments WHERE id = ?",
        [req.params.id]
      );

      if (!appointment) {
        await db.run("ROLLBACK");
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      if (appointment.status === "cancelled") {
        await db.run("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Appointment is already cancelled",
        });
      }

      // Update appointment status
      await db.run(
        'UPDATE appointments SET status = ?, updatedAt = datetime("now") WHERE id = ?',
        ["cancelled", req.params.id]
      );

      // Restore the time slot to doctor's availability
      const doctor = await db.get("SELECT * FROM doctors WHERE id = ?", [
        appointment.doctorId,
      ]);
      if (doctor) {
        let availableSlots = JSON.parse(doctor.availableSlots || "[]");

        let dateSlot = availableSlots.find(
          (slot) => slot.date === appointment.date
        );
        if (!dateSlot) {
          dateSlot = { date: appointment.date, slots: [] };
          availableSlots.push(dateSlot);
        }

        if (!dateSlot.slots.includes(appointment.time)) {
          dateSlot.slots.push(appointment.time);
          dateSlot.slots.sort();
        }

        await db.run(
          'UPDATE doctors SET availableSlots = ?, updatedAt = datetime("now") WHERE id = ?',
          [JSON.stringify(availableSlots), appointment.doctorId]
        );
      }

      await db.run("COMMIT");

      // Update analytics asynchronously
      updateAnalytics().catch((err) =>
        console.error("Failed to update analytics:", err)
      );

      res.json({
        success: true,
        message: "Appointment cancelled successfully",
        data: { ...appointment, status: "cancelled" },
      });
    } catch (error) {
      await db.run("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error(`Error in /api/appointments/:id/cancel [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: "Error cancelling appointment",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

app.get("/api/analytics", async (req, res) => {
  try {
    const db = await getDatabase();

    // Force update analytics before returning
    await updateAnalytics();

    // Get the latest analytics snapshot
    const analytics = await db.get(
      "SELECT * FROM analytics ORDER BY id DESC LIMIT 1"
    );

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics data not found",
      });
    }

    // Get additional analytics data with proper filtering
    const [
      recentAppointments,
      specialityStats,
      availableDoctors,
      monthlyStats,
    ] = await Promise.all([
      // Only get confirmed appointments
      db.all(`SELECT * FROM appointments 
             WHERE status = 'confirmed'
             ORDER BY createdAt DESC LIMIT 10`),

      db.all(
        "SELECT specialization, COUNT(*) as count FROM doctors GROUP BY specialization"
      ),

      db.get(
        "SELECT COUNT(*) as count FROM doctors WHERE availabilityStatus = ?",
        ["available"]
      ),

      // Ensure we're only counting confirmed appointments for revenue
      db.all(`
        SELECT 
          date(createdAt) as date,
          COUNT(*) as appointments,
          SUM(consultationFee) as revenue
        FROM appointments 
        WHERE status = 'confirmed' 
          AND date(createdAt) >= date('now', '-30 days')
        GROUP BY date(createdAt)
        ORDER BY date DESC
        LIMIT 30
      `),
    ]);

    // Transform speciality stats into object format
    const specialityStatsObj = specialityStats.reduce((acc, stat) => {
      acc[stat.specialization] = stat.count;
      return acc;
    }, {});

    // Calculate actual total confirmed appointments
    const totalConfirmedAppointments = monthlyStats.reduce(
      (sum, month) => sum + month.appointments,
      0
    );

    // Build the response object
    const responseData = {
      ...analytics,
      totalAppointments: totalConfirmedAppointments, // Override with actual count
      recentAppointments,
      specialityStats: specialityStatsObj,
      availableDoctors: availableDoctors.count,
      monthlyStats,
      lastUpdated: new Date().toISOString(), // Current timestamp
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error(`Error in /api/analytics [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

app.get("/api/health", async (req, res) => {
  const startTime = Date.now();

  try {
    const db = await getDatabase();

    // Test database connectivity
    const dbTest = await db.get("SELECT 1 as test");
    const dbResponseTime = Date.now() - startTime;

    // Get basic system info
    const [doctorCount, appointmentCount, uptime] = await Promise.all([
      db.get("SELECT COUNT(*) as count FROM doctors"),
      db.get("SELECT COUNT(*) as count FROM appointments"),
      process.uptime(),
    ]);

    const healthData = {
      success: true,
      message: "NirogGyan API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptime: Math.floor(uptime),
      database: {
        connected: dbTest.test === 1,
        responseTime: `${dbResponseTime}ms`,
      },
      stats: {
        totalDoctors: doctorCount.count,
        totalAppointments: appointmentCount.count,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    res.json(healthData);
  } catch (error) {
    console.error(`Error in /api/health [${req.ip}]:`, error);
    res.status(503).json({
      success: false,
      message: "Service unavailable",
      timestamp: new Date().toISOString(),
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Database connection failed",
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Unhandled error [${req.ip}]:`, err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  if (dbInstance) {
    await dbInstance.close();
    console.log("Database connection closed.");
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  if (dbInstance) {
    await dbInstance.close();
    console.log("Database connection closed.");
  }
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    console.log(`🚀 NirogGyan API Server running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to initialize database on startup:", error);
    process.exit(1);
  }
});

module.exports = app;
