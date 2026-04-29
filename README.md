# 🦅 Talon Platform - Project Setup Guide

Welcome to the **Talon Platform**, a premium golf performance tracking engine with global social impact.

## 🚀 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, GSAP (Animations), Lucide Icons.
- **Backend**: Node.js, Express, Nodemailer (Email).
- **Database**: Supabase (PostgreSQL + Auth).
- **Payments**: Paddle Integration.

---

## 🛠️ Backend Setup (Local)

1.  **Navigate to backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    *The server will run on [http://localhost:5000](http://localhost:5000)*

---

## 🎨 Frontend Setup (Local)

1.  **Navigate to frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the `frontend/` folder:
    ```env
    VITE_BACKEND_URL=http://localhost:5000
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    *The application will run on [http://localhost:5173](http://localhost:5173)*

---
---

## 🔑 Administrative Access
The Admin Panel is protected by an internal guard.
- **URL**: `/admin`
- **Default Credentials**: Check `AdminPanel.tsx` or contact the lead dev for production login.

---

## 💎 Features
- **Cinematic Experience**: High-fidelity GSAP animations on the landing page.
- **Winner Verification**: Automated draw engine with email notifications and proof upload system.
- **Luxury Dashboard**: Premium dark-mode UI for tracking performance and charitable impact.
