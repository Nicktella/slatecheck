require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');
const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// JWT Auth Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// 👤 Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hash]
    );
    res.status(201).json({ message: "User registered!" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// 🔑 Login (UPDATED - now returns user info)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    // Return both token and user info (as expected by client)
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// 🔐 Verify Token (NEW ENDPOINT)
app.get('/verify-token', authenticateJWT, async (req, res) => {
  try {
    // Get user info from database using the userId from the token
    const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [req.user.userId]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(500).json({ error: "Token verification failed" });
  }
});

// 📤 Upload CSV File
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = path.resolve(req.file.path);
  const results = [];
  let rowNum = 1;

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (!row['name'] || !row['email']) {
            results.push({
              filename: req.file.originalname,
              row_number: rowNum,
              error_message: 'Missing name or email field',
            });
          }
          rowNum++;
        })
        .on('end', resolve)
        .on('error', reject);
    });

    for (const err of results) {
      await pool.query(
        `INSERT INTO audit_logs (filename, row_number, error_message, created_at)
         VALUES ($1, $2, $3, now())`,
        [err.filename, err.row_number, err.error_message]
      );
    }

    res.status(200).json({ message: 'Upload processed', errorsLogged: results.length });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Server error during upload' });
  } finally {
    fs.unlink(filePath, () => {}); // always clean up the file
  }
});

// 🔍 Get Audit Logs (protected)
app.get('/audit', authenticateJWT, async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const logsQuery = `
      SELECT * FROM audit_logs
      WHERE filename ILIKE $1 OR error_message ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) FROM audit_logs
      WHERE filename ILIKE $1 OR error_message ILIKE $1
    `;

    const searchTerm = `%${search}%`;
    const logs = await pool.query(logsQuery, [searchTerm, limit, offset]);
    const count = await pool.query(countQuery, [searchTerm]);

    res.json({
      logs: logs.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Audit Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// 📥 Export as CSV (protected)
app.get('/export', authenticateJWT, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100'
    );

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('audit_logs.csv');
    res.send(csv);
  } catch (err) {
    console.error('CSV Export Error:', err);
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: /login, /register, /verify-token`);
  console.log(`📊 Protected endpoints: /audit, /export`);
});