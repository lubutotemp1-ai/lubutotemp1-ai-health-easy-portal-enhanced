const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'health_portal.db');

let dbReady = false;

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
    console.log('⚠️ Running in read-only/limited mode. Consider using MongoDB for production.');
    // Don't throw - let API still start
  } else {
    console.log('✅ Connected to SQLite database at:', DB_PATH);
    dbReady = true;
  }
});

// Initialize database tables - Only create if they don't exist
// IMPORTANT: Do NOT drop tables here - user data should persist
// CRITICAL NOTE: If you need to perform database migrations in the future:
//   1. Create a separate migration script (e.g., backend/db/migrate.js)
//   2. Never drop tables in this initialization file
//   3. User data must only be removed by admin action through the UI
db.serialize(() => {

  // Users table (patients and admins)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'patient',
      phone TEXT,
      date_of_birth TEXT,
      blood_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Doctors table
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      department TEXT,
      specialization TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Appointments table
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    )
  `);

  // Health records table - with proper patient_id constraint
  db.run(`
    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      record_type TEXT,
      file_url TEXT,
      record_date TEXT NOT NULL,
      weight REAL,
      height REAL,
      blood_pressure TEXT,
      heart_rate INTEGER,
      blood_sugar REAL,
      temperature REAL,
      notes TEXT,
      recorded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  // Medications table - with proper patient_id constraint
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      prescribed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  // Education materials table
  db.run(`
    CREATE TABLE IF NOT EXISTS education_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      category TEXT,
      file_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      sender_role TEXT NOT NULL,
      receiver_id INTEGER,
      receiver_role TEXT,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES doctors(id)
    )
  `);

  // Diagnosis table
  db.run(`
    CREATE TABLE IF NOT EXISTS diagnosis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symptoms TEXT NOT NULL,
      diagnosis_result TEXT,
      recommendations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Doctor schedules table (for blocking specific dates)
  db.run(`
    CREATE TABLE IF NOT EXISTS doctor_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      doctor_name TEXT,
      schedule_date TEXT,
      day_of_week TEXT,
      start_time TEXT,
      end_time TEXT,
      is_available INTEGER DEFAULT 1,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    )
  `);

  // AI Diagnoses table
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_diagnoses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      patient_name TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      duration TEXT,
      severity TEXT,
      diagnosis TEXT NOT NULL,
      sent_to_doctor INTEGER DEFAULT 0,
      doctor_id INTEGER,
      sent_to_doctor_name TEXT,
      appointment_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    )
  `);

  // Admins table (separate table for admin users)
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin into both users and admins tables
  const bcrypt = require('bcryptjs');
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  db.run(
    `INSERT OR IGNORE INTO users (name, email, password, role) VALUES ('Admin', 'admin@hospital.com', ?, 'admin')`,
    [adminPasswordHash]
  );
  db.run(
    `INSERT OR IGNORE INTO admins (name, email, password) VALUES ('Admin', 'admin@hospital.com', ?)`,
    [adminPasswordHash]
  );
});

// Helper method to get a single row
db.get_ = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper method to run a query (INSERT, UPDATE, DELETE)
db.run_ = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
};

// Helper method to get all rows
db.all_ = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Close database connection on process exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

module.exports = db;