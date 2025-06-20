# SlateCheck - Enterprise Audit Management System

<div align="center">

![SlateCheck Logo](https://img.shields.io/badge/SlateCheck-Audit%20Management-blue?style=for-the-badge&logo=file-text)

**A professional, enterprise-grade audit management system for CSV file processing and error tracking.**

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql)](https://postgresql.org/)
[![Express](https://img.shields.io/badge/Express.js-4+-000000?style=flat&logo=express)](https://expressjs.com/)

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [API](#api) • [Contributing](#contributing)

</div>

## 🌟 Features

### 🔐 **Enterprise Authentication**
- JWT-based authentication system
- Secure user registration and login
- Protected routes and API endpoints
- Persistent session management

### 📊 **Professional Dashboard**
- Real-time audit statistics and KPIs
- Interactive data visualization
- Advanced search and filtering capabilities
- Responsive design for all devices

### 📁 **CSV Processing Engine**
- Intelligent CSV file upload and validation
- Real-time error detection and logging
- Row-by-row error tracking with detailed messages
- Support for large file processing

### 🔍 **Advanced Audit Logging**
- Comprehensive error tracking and categorization
- Severity-based error classification (Critical, Warning, Error)
- Timestamp tracking for all audit events
- Export capabilities for compliance reporting

### 🎨 **Modern User Experience**
- Clean, professional enterprise design
- Intuitive navigation and user flows
- Loading states and error handling
- Accessibility-compliant interface

## 🚀 Demo

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x500/f8fafc/1f2937?text=SlateCheck+Dashboard)

### Authentication Flow
![Login](https://via.placeholder.com/400x300/18181b/ffffff?text=Login+Screen)
![Register](https://via.placeholder.com/400x300/18181b/ffffff?text=Register+Screen)

## 🛠️ Tech Stack

### Frontend
- **React 18+** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful icon library
- **Custom CSS** - Professional styling system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **csv-parser** - CSV processing

### DevOps & Tools
- **Vite** - Fast development build tool
- **pgAdmin 4** - Database administration
- **dotenv** - Environment configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**
- **Git**

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/slatecheck.git
cd slatecheck
```

### 2. Set Up the Database

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE slatecheck;

-- Create required tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  row_number INTEGER NOT NULL,
  error_message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/slatecheck
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
```

### 5. Start the Application

```bash
# Terminal 1 - Start the server
cd server
npm start

# Terminal 2 - Start the client
cd client
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📖 Usage

### Getting Started

1. **Register a new account** using the registration form
2. **Login** with your credentials
3. **Upload CSV files** for audit processing
4. **Monitor errors** through the dashboard
5. **Export audit logs** for compliance reporting

### CSV File Format

Your CSV files should contain the following required fields:
- `name` - Required field
- `email` - Required field

Example CSV structure:
```csv
name,email,department
John Doe,john@example.com,Engineering
Jane Smith,jane@example.com,Marketing
```

### Error Types

SlateCheck categorizes errors into three severity levels:

- **🔴 Critical**: Fatal errors that prevent processing
- **🟡 Warning**: Non-fatal issues that should be reviewed
- **🟠 Error**: Standard validation failures

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Login User
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Verify Token
```http
GET /verify-token
Authorization: Bearer <jwt_token>
```

### Protected Endpoints

#### Get Audit Logs
```http
GET /audit?search=&page=1&limit=10
Authorization: Bearer <jwt_token>
```

#### Upload CSV File
```http
POST /upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <csv_file>
```

#### Export Audit Logs
```http
GET /export
Authorization: Bearer <jwt_token>
```

## 🏗️ Project Structure

```
slatecheck/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── AuthContext.jsx # Authentication context
│   │   ├── App.jsx         # Main application component
│   │   ├── Login.jsx       # Login page component
│   │   ├── Register.jsx    # Registration page component
│   │   ├── Upload.jsx      # File upload component
│   │   └── index.css       # Application styles
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend application
│   ├── uploads/            # Temporary file storage
│   ├── index.js            # Express server configuration
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## 🔧 Development

### Running in Development Mode

```bash
# Start server with auto-reload
cd server
npm install -g nodemon
nodemon index.js

# Start client with hot-reload
cd client
npm run dev
```

### Database Management

Use pgAdmin 4 or command line to manage your PostgreSQL database:

```bash
# Connect to database
psql -U username -d slatecheck

# View tables
\dt

# Query audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
PORT=3001
```

### Build for Production

```bash
# Build client
cd client
npm run build

# The build files will be in client/dist/
```

## 🧪 Testing

```bash
# Run client tests
cd client
npm test

# Run server tests
cd server
npm test
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new functionality
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Nicktella** - [YourGitHub](https://github.com/Nicktella)

## 🙏 Acknowledgments

- React team for the amazing framework
- PostgreSQL community for the robust database
- Express.js for the lightweight web framework
- All open-source contributors who made this possible

## 📞 Support

If you have any questions or need help:

- 📧 **Email**: nicktellah5600@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Nicktella/slatecheck/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Nicktella/slatecheck/discussions)

---

<div align="center">

**Built with ❤️ for enterprise audit management**

⭐ Star this repository if you found it helpful!

</div>
