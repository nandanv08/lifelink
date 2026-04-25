# 🩸 LifeLink

**LifeLink** is a modern, production-ready MERN stack blood donation platform designed to bridge the gap between blood donors, verified hospitals, and patients in critical need. The platform features an intelligent donor matching algorithm, a real-time emergency broadcasting system, and dedicated dashboards for a multi-role user system.

![LifeLink Banner](https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=2000&auto=format&fit=crop) *(Demo image representation)*

## ✨ Key Features

### 🧑‍💼 Multi-Role Authentication System
A robust JWT-based authentication system with conditional routing and private dashboards.
* **Donors:** Sign up, securely link your donor profile, track health metrics (Hemoglobin, BP), update your live availability, and track your donation history.
* **Hospitals:** Dedicated registration flow requiring platform verification. Verified hospitals can broadcast urgent blood requirements to all active nearby donors.
* **Admins:** High-level platform oversight. Verify and revoke hospital licenses, oversee global system metrics, and manage the donor ecosystem.

### 🚨 Emergency Broadcast Module
When an urgent request is created, LifeLink immediately runs a geospatial and compatibility algorithm. It matches the requirement against active donors filtering by:
1. **Blood Group Compatibility** (e.g. AB+ can receive from anyone, O- can only receive O-).
2. **Current Availability Status**
3. **State / City Proximity**
4. **90-Day Cooldown Eligibility**

### 📊 Smart Match Scoring Algorithm
LifeLink ranks matching donors dynamically based on:
- Fast Response Rate History
- Active platform presence (Last Online)
- Geographical proximity (Bonus points for exact City match)
- Historic reliable donation count

## 🛠️ Tech Stack

**Frontend:**
* React 18 (Vite)
* React Router v6
* Global Context API
* Plain CSS3 (Variable-driven Design System)
* Glassmorphic UI & Keyframe Micro-animations

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* JWT (JSON Web Tokens)
* BcryptJS (Password Hashing)
* Built-in `mongodb-memory-server` for seamless local testing without DB installations.

## 🚀 Quick Start Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/nandanv08/lifelink.git
cd lifelink
```

### 2. Backend Setup
```bash
cd backend
npm install

# (Optional) Create a .env file based on environment needs. By default, it falls back to port 5001.
# Start the backend server (Automatically uses Mongo Memory Server and auto-seeds data if local Mongo isn't running)
npm start
```

### 3. Frontend Setup
```bash
# In a new terminal window
cd frontend
npm install

# Start the Vite development server
npm run dev
```

### 4. Demo Login Credentials
When the backend automatically seeds the memory database, you can log in using these preset credentials at `http://localhost:5173/login`:
* **Admin:** `admin@lifelink.com` / `admin123`
* **Hospital:** `hospital1@lifelink.com` / `hospital123`
* **Donor:** `donor@lifelink.com` / `donor123`

## 📂 Project Structure

```
lifelink/
├── backend/
│   ├── config/          # DB connection & Memory Server fallback
│   ├── controllers/     # Core logic (Auth, Donors, Requests, Analytics)
│   ├── middleware/      # JWT Protection & Role Validation
│   ├── models/          # Mongoose Schemas (User, Donor, Request)
│   ├── routes/          # Express API Routes
│   ├── seed.js          # Realistic mock data population script
│   └── server.js        # Main Express application entry
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI (Navbar, DonorCard, Admin Dashboard)
    │   ├── context/     # AppContext (Auth state, Notifications)
    │   ├── pages/       # Next-level page views (Home, Login, Emergency)
    │   ├── services/    # api.js fetch wrappers matching backend endpoints
    │   ├── App.jsx      # React Router config
    │   └── index.css    # Global CSS Design system & Tokens
    └── vite.config.js   # Vite proxy and configuration
```

## 🔒 Security & Privacy
- **Password encryption.** Bcrypt handles secure hashing before saving models to the DB.
- **Data masking.** The public API masks donor emails and phone numbers unless accessed via Admin privileges. Medical condition notes are fully restricted from public endpoints.
- **Route protection.** API calls are intercepted by JWT middleware checking for valid `Bearer` tokens and explicit role types.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
