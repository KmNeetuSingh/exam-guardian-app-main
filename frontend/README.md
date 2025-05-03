# Exam Guardian

A full-stack web application for secure online exam monitoring and proctoring.

## Features
- User authentication (student/proctor) with JWT
- Role-based access control
- Exam creation and management
- Exam session handling and monitoring
- Centralized API handling in frontend

---

## Backend Setup (Node.js, Express, MongoDB)

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Create a `.env` file in the `backend` folder:**
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```
3. **Start the backend server:**
   ```bash
   npm run dev
   ```

---

## Frontend Setup (React, Vite, TypeScript)

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Create a `.env` file in the frontend root:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. **Start the frontend dev server:**
   ```bash
   npm run dev
   ```

---

## API Integration
- All API requests are managed via `src/api/api.ts` using Axios.
- JWT tokens are auto-attached for secure routes.
- Update API calls in components to use the exported functions from `src/api/api.ts`.

---

## Folder Structure
```
backend/         # Node.js/Express/MongoDB backend
src/api/api.ts   # Centralized API functions for frontend
src/pages/       # React pages (login, register, dashboard, etc.)
```

---

## License
MIT
