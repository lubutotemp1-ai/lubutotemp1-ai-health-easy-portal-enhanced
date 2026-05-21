const mongoose = require('mongoose');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.error('Please add DATABASE_URL to .env file');
  process.exit(1);
}

// Connection options
const connectOptions = {
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB
mongoose.connect(DATABASE_URL, connectOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// ===== SCHEMAS =====

// Users Schema (Patients & Admins)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient', enum: ['patient', 'admin', 'staff'] },
  phone: String,
  date_of_birth: String,
  blood_type: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Doctors Schema
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: String,
  specialization: String,
  phone: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Appointments Schema
const appointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  title: { type: String, required: true },
  description: String,
  appointment_date: { type: String, required: true },
  appointment_time: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
  notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Health Records Schema
const healthRecordSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  record_type: String,
  file_url: String,
  record_date: { type: String, required: true },
  weight: Number,
  height: Number,
  blood_pressure: String,
  heart_rate: Number,
  blood_sugar: Number,
  temperature: Number,
  notes: String,
  recorded_by: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Medications Schema
const medicationSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: String,
  frequency: String,
  start_date: String,
  end_date: String,
  notes: String,
  prescribed_by: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now }
});

// Education Materials Schema
const educationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: String,
  category: String,
  file_url: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Chat Messages Schema
const chatSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  sender_role: { type: String, required: true },
  receiver_id: mongoose.Schema.Types.ObjectId,
  receiver_role: String,
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

// Diagnosis Schema
const diagnosisSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: { type: String, required: true },
  diagnosis_result: String,
  recommendations: String,
  created_at: { type: Date, default: Date.now }
});

// Doctor Schedules Schema
const doctorScheduleSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctor_name: String,
  schedule_date: String,
  day_of_week: String,
  start_time: String,
  end_time: String,
  is_available: { type: Boolean, default: true },
  reason: String,
  created_at: { type: Date, default: Date.now }
});

// AI Diagnoses Schema
const aiDiagnosisSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient_name: { type: String, required: true },
  symptoms: { type: String, required: true },
  duration: String,
  severity: String,
  diagnosis: { type: String, required: true },
  sent_to_doctor: { type: Boolean, default: false },
  doctor_id: mongoose.Schema.Types.ObjectId,
  sent_to_doctor_name: String,
  appointment_id: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// ===== MODELS =====
const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
const Medication = mongoose.model('Medication', medicationSchema);
const Education = mongoose.model('Education', educationSchema);
const ChatMessage = mongoose.model('ChatMessage', chatSchema);
const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);
const DoctorSchedule = mongoose.model('DoctorSchedule', doctorScheduleSchema);
const AiDiagnosis = mongoose.model('AiDiagnosis', aiDiagnosisSchema);
const Admin = mongoose.model('Admin', adminSchema);

// ===== HELPER FUNCTIONS (API Compatible with SQLite) =====

// Mock SQLite-like interface for compatibility
const db = {
  // Get single row by SQL query
  get_: async function(sql, params = []) {
    try {
      // Parse SQL to determine model and query
      if (sql.includes('SELECT') && sql.includes('FROM users')) {
        if (sql.includes('WHERE email')) {
          return await User.findOne({ email: params[0] });
        } else if (sql.includes('WHERE id')) {
          return await User.findById(params[0]);
        }
      }
      if (sql.includes('SELECT') && sql.includes('FROM doctors')) {
        if (sql.includes('WHERE email')) {
          return await Doctor.findOne({ email: params[0] });
        } else if (sql.includes('WHERE id')) {
          return await Doctor.findById(params[0]);
        }
      }
      if (sql.includes('SELECT') && sql.includes('FROM admins')) {
        if (sql.includes('WHERE email')) {
          return await Admin.findOne({ email: params[0] });
        }
      }
      return null;
    } catch (err) {
      console.error('❌ db.get_ error:', err.message);
      throw err;
    }
  },

  // Run INSERT, UPDATE, DELETE query
  run_: async function(sql, params = []) {
    try {
      // INSERT INTO users
      if (sql.includes('INSERT INTO users')) {
        const user = new User({
          name: params[0],
          email: params[1],
          password: params[2],
          phone: params[3],
          date_of_birth: params[4],
          blood_type: params[5]
        });
        const saved = await user.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO doctors
      if (sql.includes('INSERT INTO doctors')) {
        const doctor = new Doctor({
          name: params[0],
          email: params[1],
          password: params[2],
          department: params[3],
          specialization: params[4],
          phone: params[5]
        });
        const saved = await doctor.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO admins
      if (sql.includes('INSERT INTO admins')) {
        const admin = new Admin({
          name: params[0],
          email: params[1],
          password: params[2]
        });
        const saved = await admin.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO appointments
      if (sql.includes('INSERT INTO appointments')) {
        const appt = new Appointment({
          patient_id: params[0],
          doctor_id: params[1],
          title: params[2],
          description: params[3],
          appointment_date: params[4],
          appointment_time: params[5],
          status: params[6] || 'pending',
          notes: params[7]
        });
        const saved = await appt.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO health_records
      if (sql.includes('INSERT INTO health_records')) {
        const record = new HealthRecord({
          patient_id: params[0],
          title: params[1],
          description: params[2],
          record_date: params[3],
          weight: params[4],
          blood_pressure: params[5],
          heart_rate: params[6],
          blood_sugar: params[7],
          temperature: params[8],
          notes: params[9]
        });
        const saved = await record.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO medications
      if (sql.includes('INSERT INTO medications')) {
        const med = new Medication({
          patient_id: params[0],
          name: params[1],
          dosage: params[2],
          frequency: params[3],
          start_date: params[4],
          end_date: params[5],
          notes: params[6]
        });
        const saved = await med.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO chat_messages
      if (sql.includes('INSERT INTO chat_messages')) {
        const msg = new ChatMessage({
          sender_id: params[0],
          sender_role: params[1],
          receiver_id: params[2],
          receiver_role: params[3],
          message: params[4]
        });
        const saved = await msg.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO diagnosis
      if (sql.includes('INSERT INTO diagnosis')) {
        const diag = new Diagnosis({
          user_id: params[0],
          symptoms: params[1],
          diagnosis_result: params[2],
          recommendations: params[3]
        });
        const saved = await diag.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      // INSERT INTO ai_diagnoses
      if (sql.includes('INSERT INTO ai_diagnoses')) {
        const aiDiag = new AiDiagnosis({
          patient_id: params[0],
          patient_name: params[1],
          symptoms: params[2],
          duration: params[3],
          severity: params[4],
          diagnosis: params[5]
        });
        const saved = await aiDiag.save();
        return { lastInsertRowid: saved._id, changes: 1 };
      }

      return { lastInsertRowid: null, changes: 0 };
    } catch (err) {
      console.error('❌ db.run_ error:', err.message);
      throw err;
    }
  },

  // Get all rows
  all_: async function(sql, params = []) {
    try {
      // SELECT FROM users
      if (sql.includes('SELECT') && sql.includes('FROM users')) {
        if (sql.includes('WHERE role')) {
          return await User.find({ role: params[0] });
        }
        return await User.find();
      }

      // SELECT FROM doctors
      if (sql.includes('SELECT') && sql.includes('FROM doctors')) {
        return await Doctor.find();
      }

      // SELECT FROM appointments
      if (sql.includes('SELECT') && sql.includes('FROM appointments')) {
        if (sql.includes('WHERE patient_id')) {
          return await Appointment.find({ patient_id: params[0] });
        }
        if (sql.includes('WHERE doctor_id')) {
          return await Appointment.find({ doctor_id: params[0] });
        }
        return await Appointment.find();
      }

      // SELECT FROM health_records
      if (sql.includes('SELECT') && sql.includes('FROM health_records')) {
        if (sql.includes('WHERE patient_id')) {
          return await HealthRecord.find({ patient_id: params[0] });
        }
        return await HealthRecord.find();
      }

      // SELECT FROM medications
      if (sql.includes('SELECT') && sql.includes('FROM medications')) {
        if (sql.includes('WHERE patient_id')) {
          return await Medication.find({ patient_id: params[0] });
        }
        return await Medication.find();
      }

      // SELECT FROM chat_messages
      if (sql.includes('SELECT') && sql.includes('FROM chat_messages')) {
        if (sql.includes('WHERE sender_id')) {
          return await ChatMessage.find({ sender_id: params[0] });
        }
        return await ChatMessage.find();
      }

      return [];
    } catch (err) {
      console.error('❌ db.all_ error:', err.message);
      throw err;
    }
  }
};

// Insert default admin on startup
async function seedDefaultAdmin() {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@hospital.com' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      const admin = new Admin({
        name: 'Admin',
        email: 'admin@hospital.com',
        password: hashedPassword
      });
      await admin.save();
      console.log('✅ Default admin created');

      // Also create in users table with admin role
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@hospital.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();
    }
  } catch (err) {
    console.error('⚠️ Error seeding admin:', err.message);
  }
}

// Seed on startup
setTimeout(seedDefaultAdmin, 2000);

// Export for use in routes
module.exports = db;
