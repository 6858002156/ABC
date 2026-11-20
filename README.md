Markdown
# ⚡ Thailand Charge Pass (Volt Jai - Thailand EV)

A modern, full-featured web application for Electric Vehicle (EV) drivers in Thailand to discover charging stations, compare Time-of-Use (TOU) rates, simulate real-time charging sessions, manage EV profiles, and get instant answers from a smart EV Charging Assistant.

---

## ✨ Key Features

- **🗺️ Interactive EV Charging Map:** Browse 40+ EV charging stations across Bangkok and major provinces in Thailand (Chiang Mai, Phuket, Pattaya, Hua Hin, Ayutthaya, Nakhon Ratchasima, etc.).
- **🔍 Smart Network & Power Filters:** Filter stations dynamically by charging network (**PTT EV Station PluZ, EA Anywhere, PEA VOLTA, ELEX by EGAT, MG Super Charge, Tesla Supercharger, SHARGE**), availability status, and DC Fast Charging (>50 kW).
- **🤖 Smart EV AI Assistant (Ask AI):** Context-aware assistant supporting both Thai and English that searches station data, calculates estimated charging time and cost based on your active EV battery capacity, and answers EV-related questions.
- **🔌 Real-Time Charging Simulation & TOU Rates:** Displays Thailand Time-of-Use (On-Peak / Off-Peak) rates per kWh, simulates active charging sessions (kWh & THB progress), and automatically deducts charging costs from your in-app wallet.
- **🚗 My EV, Garage & Wallet:** Manage your EV vehicles (e.g., BYD Seal AWD), track charging history, and monitor your dynamic THB wallet balance.
- **📅 Station Bookings & Community:** Reserve charging slots in advance and share tips or station reviews with fellow EV drivers.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Map & Location:** Interactive Map Components & Geo-filtering
- **State & Storage:** Local Mock API with persistent `localStorage` state for standalone offline/local execution

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/6858002156/Gen-Ai.git](https://github.com/6858002156/Gen-Ai.git)
   cd Gen-Ai
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Open in your browser:
Navigate to http://localhost:5173

📂 Project Structure

Plaintext

├── public/                 # Static assets and manifest.json
├── src/
│   ├── components/         # Reusable UI, Map, AskAI, ChargingSession, Wallet & Trip components
│   ├── hooks/              # Custom React hooks (useWallet, useAllStations, etc.)
│   ├── lib/                # Standalone mockApi, charging calculators & utility functions
│   ├── pages/              # Main application views (MapHome, MyEV, Bookings, Community, etc.)
│   ├── App.jsx             # Root application component and routing
│   └── main.jsx            # Entry point
├── index.html              # HTML template
├── package.json            # Project dependencies and scripts
└── vite.config.js          # Vite configuration with '@' path alias
