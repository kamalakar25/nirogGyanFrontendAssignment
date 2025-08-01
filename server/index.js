const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB configuration
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/niroggyan';
let client = null;
let db = null;

// Initialize MongoDB connection
async function getDatabase() {
  if (!client) {
    client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db('niroggyan');

    // Create indexes for better performance
    await db.collection('doctors').createIndex({ name: 1, specialization: 1 });
    await db.collection('doctors').createIndex({ availabilityStatus: 1 });
    await db.collection('appointments').createIndex({ patientEmail: 1 });
    await db.collection('appointments').createIndex({ doctorId: 1 });
    await db.collection('appointments').createIndex({ date: 1 });
    await db.collection('appointments').createIndex({ status: 1 });
  }
  return db;
}

// Stricter rate limiter for debugging with IPv6-safe key generator
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20, // Limit each IP to 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP ${req.ip} on ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
});

app.use(limiter);

// Initialize database collections and sample data
async function initializeDatabase() {
  const db = await getDatabase();

  // Initialize analytics if not exists
  const analyticsCount = await db.collection('analytics').countDocuments();
  if (analyticsCount === 0) {
    await db.collection('analytics').insertOne({
      totalAppointments: 0,
      totalDoctors: 0,
      totalPatients: 0,
      monthlyRevenue: 0,
      lastUpdated: new Date(),
    });
  }

  // Initialize sample doctors if not exists
  const doctorsCount = await db.collection('doctors').countDocuments();
  if (doctorsCount === 0) {
    const sampleDoctors = [
      {
        _id: '1',
        name: 'Dr. Kusuma',
        specialization: 'Cardiologist',
        image:
          'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.9,
        experience: 12,
        availabilityStatus: 'available',
        consultationFee: 1200,
        location: 'Downtown Medical Center',
        about:
          'Dr. Kusuma is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases and preventive cardiology.',
        education: [
          'MD - Harvard Medical School',
          'Residency - Johns Hopkins Hospital',
          'Fellowship - Mayo Clinic',
        ],
        languages: ['English', 'Hindi'],
        availableSlots: [
          {
            date: '2025-08-10',
            slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'],
          },
          {
            date: '2025-08-11',
            slots: ['10:00 AM', '11:30 AM', '01:00 PM', '04:00 PM'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '2',
        name: 'Dr. Rajesh Kumar',
        specialization: 'Dermatologist',
        image:
          'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8,
        experience: 8,
        availabilityStatus: 'available',
        consultationFee: 950,
        location: 'Skin Care Clinic',
        about:
          'Dr. Rajesh Kumar is a renowned dermatologist specializing in medical and cosmetic dermatology with expertise in skin cancer detection.',
        education: [
          'MD - AIIMS Delhi',
          'Residency - PGI Chandigarh',
          'Fellowship - Manipal Hospital',
        ],
        languages: ['English', 'Hindi', 'Tamil'],
        availableSlots: [
          {
            date: '2025-08-10',
            slots: ['08:00 AM', '11:00 AM', '01:30 PM', '04:00 PM'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '3',
        name: 'Dr. Priya Sharma',
        specialization: 'Pediatrician',
        image:
          'https://images.pexels.com/photos/5327920/pexels-photo-5327920.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7,
        experience: 10,
        availabilityStatus: 'available',
        consultationFee: 1000,
        location: 'Child Care Hospital, Mumbai',
        about:
          'Dr. Priya Sharma specializes in pediatric care with a focus on neonatal health and childhood development disorders.',
        education: [
          'MBBS - KEM Hospital, Mumbai',
          'DCH - Seth GS Medical College',
          'Fellowship - Apollo Hospitals',
        ],
        languages: ['English', 'Hindi', 'Marathi'],
        availableSlots: [
          { date: '2025-08-10', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
          { date: '2025-08-11', slots: ['10:00 AM', '12:00 PM', '03:00 PM'] },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '4',
        name: 'Dr. Ananya Gupta',
        specialization: 'Neurologist',
        image:
          'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8,
        experience: 15,
        availabilityStatus: 'available',
        consultationFee: 1500,
        location: 'Brain & Spine Clinic, Delhi',
        about:
          "Dr. Ananya Gupta is an expert in treating neurological disorders, including epilepsy, stroke, and Parkinson's disease, with a focus on patient-centric care.",
        education: [
          'DM Neurology - AIIMS Delhi',
          'Residency - NIMHANS Bangalore',
          'Fellowship - Cleveland Clinic',
        ],
        languages: ['English', 'Hindi', 'Bengali'],
        availableSlots: [
          {
            date: '2025-08-10',
            slots: ['10:00 AM', '12:30 PM', '03:00 PM', '04:30 PM'],
          },
          {
            date: '2025-08-11',
            slots: ['09:30 AM', '11:00 AM', '02:00 PM'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '5',
        name: 'Dr. Vikram Singh',
        specialization: 'Orthopedic Surgeon',
        image:
          'https://images.pexels.com/photos/5327578/pexels-photo-5327578.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.9,
        experience: 11,
        availabilityStatus: 'available',
        consultationFee: 1300,
        location: 'Bone & Joint Hospital, Chennai',
        about:
          'Dr. Vikram Singh specializes in joint replacement surgeries and sports injuries, with extensive experience in minimally invasive procedures.',
        education: [
          'MS Orthopedics - Christian Medical College, Vellore',
          'Residency - Apollo Hospitals',
          'Fellowship - Singapore General Hospital',
        ],
        languages: ['English', 'Hindi', 'Punjabi'],
        availableSlots: [
          {
            date: '2025-08-10',
            slots: ['08:30 AM', '10:00 AM', '01:00 PM', '03:30 PM'],
          },
          {
            date: '2025-08-12',
            slots: ['09:00 AM', '11:30 AM', '02:30 PM'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '6',
        name: 'Dr. Meera Patel',
        specialization: 'Gynecologist',
        image:
          'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7,
        experience: 9,
        availabilityStatus: 'available',
        consultationFee: 1100,
        location: "Women's Health Center, Bangalore",
        about:
          "Dr. Meera Patel is dedicated to women's health, with expertise in high-risk pregnancies, infertility treatments, and laparoscopic surgeries.",
        education: [
          'MD Obstetrics & Gynecology - Manipal Hospital',
          "Residency - St. John's Medical College",
          'Fellowship - Fernandez Hospital',
        ],
        languages: ['English', 'Hindi', 'Kannada'],
        availableSlots: [
          {
            date: '2025-08-10',
            slots: ['09:30 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
          },
          {
            date: '2025-08-11',
            slots: ['10:30 AM', '01:00 PM', '03:30 PM'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('doctors').insertMany(sampleDoctors);

    // Update analytics with initial doctor count
    await updateAnalytics();
  }

  return db;
}

// Function to update analytics
async function updateAnalytics() {
  const db = await getDatabase();

  try {
    const appointmentCount = await db
      .collection('appointments')
      .countDocuments({ status: { $ne: 'cancelled' } });
    const doctorCount = await db.collection('doctors').countDocuments();
    const patientCount = await db
      .collection('appointments')
      .distinct('patientEmail').length;
    const revenue = await db
      .collection('appointments')
      .aggregate([
        {
          $match: {
            status: 'confirmed',
            date: {
              $gte: new Date(new Date().setDate(1)).toISOString().split('T')[0],
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$consultationFee' } } },
      ])
      .toArray();

    await db.collection('analytics').updateOne(
      {},
      {
        $set: {
          totalAppointments: appointmentCount,
          totalDoctors: doctorCount,
          totalPatients: patientCount,
          monthlyRevenue: revenue[0]?.total || 0,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('Analytics updated successfully');
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
  }
  next(err);
});

// API Routes
app.get('/api/doctors', async (req, res) => {
  try {
    const db = await getDatabase();
    const {
      search,
      specialization,
      availability,
      limit = 50,
      offset = 0,
    } = req.query;

    if (
      availability &&
      !['available', 'busy', 'unavailable'].includes(availability)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status',
      });
    }

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }
    if (specialization) {
      query.specialization = specialization;
    }
    if (availability) {
      query.availabilityStatus = availability;
    }

    const [doctors, total] = await Promise.all([
      db
        .collection('doctors')
        .find(query)
        .sort({ rating: -1, name: 1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .toArray(),
      db.collection('doctors').countDocuments(query),
    ]);

    res.json({
      success: true,
      data: doctors,
      count: doctors.length,
      total,
      hasMore: parseInt(offset) + doctors.length < total,
    });
  } catch (error) {
    console.error(`Error in /api/doctors [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

app.get('/api/doctors/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const doctor = await db
      .collection('doctors')
      .findOne({ _id: req.params.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error(`Error in /api/doctors/:id [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

app.get('/api/specializations', async (req, res) => {
  try {
    const db = await getDatabase();
    const specializations = await db
      .collection('doctors')
      .aggregate([
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    res.json({
      success: true,
      data: specializations.map((s) => ({
        name: s._id,
        count: s.count,
      })),
    });
  } catch (error) {
    console.error(`Error in /api/specializations [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specializations',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const db = await getDatabase();
    const { doctorId, patientName, patientEmail, date, time } = req.body;

    // Validation
    if (!doctorId || !patientName || !patientEmail || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
      });
    }

    if (patientName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Please select a future date',
      });
    }

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const doctor = await db
          .collection('doctors')
          .findOne({ _id: doctorId });
        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: 'Doctor not found',
          });
        }

        const dateSlot = doctor.availableSlots.find(
          (slot) => slot.date === date
        );
        if (!dateSlot || !dateSlot.slots.includes(time)) {
          return res.status(400).json({
            success: false,
            message: 'Selected time slot is not available',
          });
        }

        const existingAppointment = await db
          .collection('appointments')
          .findOne({
            doctorId,
            date,
            time,
            status: { $ne: 'cancelled' },
          });

        if (existingAppointment) {
          return res.status(400).json({
            success: false,
            message: 'This time slot is already booked',
          });
        }

        const appointment = {
          _id: uuidv4(),
          doctorId,
          doctorName: doctor.name,
          patientName: patientName.trim(),
          patientEmail: patientEmail.toLowerCase().trim(),
          date,
          time,
          consultationFee: doctor.consultationFee,
          status: 'confirmed',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection('appointments').insertOne(appointment);

        const updatedSlots = doctor.availableSlots
          .map((slot) => {
            if (slot.date === date) {
              slot.slots = slot.slots.filter((s) => s !== time);
            }
            return slot;
          })
          .filter((slot) => slot.slots.length > 0);

        await db
          .collection('doctors')
          .updateOne(
            { _id: doctorId },
            { $set: { availableSlots: updatedSlots, updatedAt: new Date() } }
          );

        res.status(201).json({
          success: true,
          message: 'Appointment booked successfully',
          data: appointment,
        });
      });
    } finally {
      await session.endSession();
    }

    updateAnalytics().catch((err) =>
      console.error('Failed to update analytics:', err)
    );
  } catch (error) {
    console.error(`Error in /api/appointments [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment. Please try again.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const db = await getDatabase();
    const { email, status, limit = 50, offset = 0 } = req.query;

    const query = {};
    if (email) {
      query.patientEmail = email.toLowerCase().trim();
    }
    if (status) {
      query.status = status;
    }

    const [appointments, total] = await Promise.all([
      db
        .collection('appointments')
        .find(query)
        .sort({ date: -1, time: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .toArray(),
      db.collection('appointments').countDocuments(query),
    ]);

    res.json({
      success: true,
      data: appointments,
      count: appointments.length,
      total,
      hasMore: parseInt(offset) + appointments.length < total,
    });
  } catch (error) {
    console.error(`Error in /api/appointments [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

app.patch('/api/appointments/:id/cancel', async (req, res) => {
  try {
    const db = await getDatabase();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const appointment = await db
          .collection('appointments')
          .findOne({ _id: req.params.id });

        if (!appointment) {
          return res.status(404).json({
            success: false,
            message: 'Appointment not found',
          });
        }

        if (appointment.status === 'cancelled') {
          return res.status(400).json({
            success: false,
            message: 'Appointment is already cancelled',
          });
        }

        await db
          .collection('appointments')
          .updateOne(
            { _id: req.params.id },
            { $set: { status: 'cancelled', updatedAt: new Date() } }
          );

        const doctor = await db
          .collection('doctors')
          .findOne({ _id: appointment.doctorId });
        if (doctor) {
          let availableSlots = doctor.availableSlots || [];
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

          await db
            .collection('doctors')
            .updateOne(
              { _id: appointment.doctorId },
              { $set: { availableSlots, updatedAt: new Date() } }
            );
        }

        res.json({
          success: true,
          message: 'Appointment cancelled successfully',
          data: { ...appointment, status: 'cancelled' },
        });
      });
    } finally {
      await session.endSession();
    }

    updateAnalytics().catch((err) =>
      console.error('Failed to update analytics:', err)
    );
  } catch (error) {
    console.error(`Error in /api/appointments/:id/cancel [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const db = await getDatabase();

    await updateAnalytics();

    const analytics = await db.collection('analytics').findOne({});

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics data not found',
      });
    }

    const [
      recentAppointments,
      specialityStats,
      availableDoctors,
      monthlyStats,
    ] = await Promise.all([
      db
        .collection('appointments')
        .find({ status: 'confirmed' })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),
      db
        .collection('doctors')
        .aggregate([{ $group: { _id: '$specialization', count: { $sum: 1 } } }])
        .toArray(),
      db
        .collection('doctors')
        .countDocuments({ availabilityStatus: 'available' }),
      db
        .collection('appointments')
        .aggregate([
          {
            $match: {
              status: 'confirmed',
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              appointments: { $sum: 1 },
              revenue: { $sum: '$consultationFee' },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 30 },
        ])
        .toArray(),
    ]);

    const specialityStatsObj = specialityStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const totalConfirmedAppointments = monthlyStats.reduce(
      (sum, month) => sum + month.appointments,
      0
    );

    const responseData = {
      ...analytics,
      totalAppointments: totalConfirmedAppointments,
      recentAppointments,
      specialityStats: specialityStatsObj,
      availableDoctors,
      monthlyStats,
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error(`Error in /api/analytics [${req.ip}]:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

app.get('/api/health', async (req, res) => {
  const startTime = Date.now();

  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    const dbResponseTime = Date.now() - startTime;

    const [doctorCount, appointmentCount, uptime] = await Promise.all([
      db.collection('doctors').countDocuments(),
      db.collection('appointments').countDocuments(),
      process.uptime(),
    ]);

    const healthData = {
      success: true,
      message: 'NirogGyan API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor(uptime),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`,
      },
      stats: {
        totalDoctors: doctorCount,
        totalAppointments: appointmentCount,
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
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Database connection failed',
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Unhandled error [${req.ip}]:`, err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    console.log(`🚀 NirogGyan API Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to initialize database on startup:', error);
    process.exit(1);
  }
});

module.exports = app;
