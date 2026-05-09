# 🏛 TVK Mylapore MLA Constituency Grievance Portal

Digital constituency service portal for **Mylapore (TVK MLA: Venkatramanan)**, where residents can register using their Voter ID (EPIC), raise local issues, share geo-location, and get response acknowledgment.

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite) + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | Firebase Firestore (or in-memory for demo) |
| **Auth** | OTP-based verification (Firebase Phone Auth in production) |
| **Maps** | Google Maps JS API + `navigator.geolocation` |
| **Icons** | Lucide React |

## 📂 Project Structure

```
grievance-portal/
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # Layout, LocationPicker
│   │   ├── pages/         # All screens
│   │   ├── App.jsx        # Routes + Context
│   │   └── main.jsx       # Entry point
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/               # Node.js + Express
│   ├── routes/
│   │   ├── auth.js        # EPIC verify, OTP, Register
│   │   ├── grievances.js  # Create, Track, User grievances
│   │   └── admin.js       # Admin respond, resolve
│   ├── db.js              # Database layer (Firestore / in-memory)
│   └── server.js          # Express server
└── README.md
```

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd grievance-portal

# Install root (concurrently)
npm install

# Install frontend + backend
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. Start development servers

```bash
# Run both frontend + backend together:
npm run dev

# OR run separately:
cd frontend && npm run dev    # → http://localhost:5173
cd backend && npm start       # → http://localhost:4000
```

### 3. Open in browser

- **Portal**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **API Health**: http://localhost:4000/api/health

## 🔐 Module 1: Entry Gate (Login / Register)

### Existing Voter Flow
1. Enter EPIC Number (e.g. `TNA1234567`)
2. Enter Mobile Number
3. Receive 6-digit OTP (demo: shown on screen)
4. Verify OTP → Access granted

### New Resident Flow
1. Fill registration form (Name*, Phone*, EPIC optional, Area, Email)
2. Receive Support Member number
3. Can raise grievances immediately

## 📋 Module 2: Grievance Categories (18 sub-categories)

All under **Infrastructure & Civic Works**:
- Pothole / Road Damage
- Road Waterlogging / Flooding
- No Street Lighting
- Broken Footpath / Pavement
- ...and 14 more

## 📍 Module 3: Issue Reporting Flow

Step 1 → Category → Step 2 → Sub-category → Step 3 → Location (GPS/Manual) → Step 4 → Description (200 char) → Step 5 → Submit → Confirmation with Grievance ID

## 💬 Module 4: Grievance Status & Response

### Citizen View (`/my-grievances`)
- Cards with status: 🔴 Open → 🔵 In Progress → 🟢 Responded → ✅ Resolved
- Progress bar
- MLA team response displayed

### Admin View (`/admin`)
- All grievances listed with filters
- Text input to respond
- Mark as Resolved

## 🔥 Firebase Setup (Production)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Firestore Database**
3. Enable **Phone Authentication**
4. Download service account key
5. Copy `.env.example` to `.env` and fill credentials

## 🗺 Google Maps API

The portal uses Google Maps Embed API for location display. To use your own API key:
1. Get a key from Google Cloud Console
2. Enable "Maps Embed API" and "Geocoding API"
3. Update the key in `LocationPicker.jsx`

## 📱 Demo Mode

The app runs in **demo mode** by default (no Firebase required). All data is stored in-memory. To test:
- Login with any EPIC (e.g. `TNA1234567`)
- Use any phone number
- OTP is displayed on screen
- Pre-seeded with 3 demo grievances in admin panel
