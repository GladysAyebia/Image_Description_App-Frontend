# Image & Data Analyzer (IDA) PWA

A **Progressive Web App (PWA) frontend** for the **Image & Data Analyzer (IDA)**, allowing users to upload images, interact with AI-generated analyses, and ask follow-up questions in real time. Fully responsive and offline-ready.

---

## **Table of Contents**

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Available Scripts](#available-scripts)
6. [PWA Features](#pwa-features)
7. [Connecting to Backend](#connecting-to-backend)
8. [Production Deployment](#production-deployment)
9. [Contributing](#contributing)
10. [License](#license)

---

## **Features**

* Upload images for AI analysis (5MB max).
* Ask follow-up questions and continue sessions.
* Receive structured **GitHub-Flavored Markdown (GFM)** responses.
* Real-time session management with backend.
* Fully responsive design with offline support (PWA).
* Mobile-friendly interface with smooth animations and notifications.

---

## **Tech Stack**

* **React** + **Vite** – Fast frontend framework
* **Redux** – State management for session data
* **Axios** – API calls to backend
* **React Router** – Page navigation
* **Service Workers** – Offline support
* **Tailwind CSS / MUI (optional)** – Styling
* **Google Generative AI** – Powered via backend

---

## **Getting Started**

### **1. Clone the repository**

```bash
git clone https://github.com/your-username/ida-frontend.git
cd ida-frontend
```

### **2. Install dependencies**

```bash
npm install
```

### **3. Create `.env` file**

```bash
touch .env
```

Add the following variables:

```
VITE_BACKEND_URL=http://localhost:5000
```

### **4. Run the development server**

```bash
npm run dev
```

Your PWA runs on `http://localhost:5173` by default.

---

## **Available Scripts**

* `npm run dev` – Start development server
* `npm run build` – Build production-ready PWA
* `npm run preview` – Preview production build locally

---

## **PWA Features**

* **Installable on devices** – Works like a native app
* **Offline support** – Cached pages and responses
* **Notifications** – Optional future feature for follow-up results

---

## **Connecting to Backend**

Ensure your backend is running and `VITE_BACKEND_URL` points to it:

* Example: `http://localhost:5000` for local development
* Update the URL for production deployment

API endpoints used:

* `POST /api/analyze` – Upload image and prompt
* `POST /api/followup` – Ask follow-up questions

---

## **Production Deployment**

1. Build the app:

```bash
npm run build
```

2. Deploy using any static hosting:

   * **Vercel**
   * **Netlify**
   * **Firebase Hosting**
   * Or your preferred provider

3. Ensure **CORS** is enabled on the backend for the deployed frontend URL.

---

## **Contributing**

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

---

## **License**

MIT License © 2025 Gladys Ayebia Ashong


