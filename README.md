# Smart Attendence marking system

A full-stack attendance management system built with the MERN stack (MongoDB, Express.js, React, Node.js) and containerized using Docker for easy deployment.

## Features

- **User Authentication**: Register and login as admin or student with JWT-based authentication.
- **Role-Based Access**: Admins can manage users and mark attendance; students can view their attendance records.
- **Attendance Tracking**: Mark attendance for individual students or in bulk, with statuses (present, absent, late).
- **Dashboards**: Separate dashboards for admins (user management, stats) and students (personal attendance history).
- **Responsive UI**: Built with React, Tailwind CSS, and Vite for a modern, mobile-friendly interface.
- **Containerized Deployment**: Docker Compose setup for local development and production.

## Tech Stack

- **Frontend**: React, React Router, Axios, Tailwind CSS, Vite, Lucide React, Recharts, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, CORS
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose
- **Deployment**: Nginx (for frontend serving)

## Prerequisites

- Docker and Docker Compose installed on your system.
- A Docker Hub account (for pulling images; set `DOCKERHUB_USERNAME` in `.env` or environment).

## Installation and Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/attendance-system.git
   cd attendance-system
   ```

2. **Environment Variables**:
   - Create a `.env` file in the root directory (or set environment variables).
   - Set `DOCKERHUB_USERNAME` to your Docker Hub username (e.g., `export DOCKERHUB_USERNAME=yourusername`).

3. **Build and Run with Docker Compose**:

   ```bash
   docker-compose up --build
   ```

   - This will start MongoDB, backend, and frontend services.
   - Access the app at `http://localhost` (frontend on port 80).
   - Backend API at `http://localhost:5000`.

4. **For Development**:
   - Backend: `cd backend && npm install && npm start`
   - Frontend: `cd frontend && npm install && npm run dev`
   - MongoDB: Run separately or via Docker.

## Usage

- **Register/Login**: Create an account or log in.
- **Admin Dashboard**: Manage users, view stats, mark attendance.
- **Student Dashboard**: View personal attendance records.
- **Mark Attendance**: Admins can mark for students via the `/mark-attendance` page.

### API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/attendance/mark` - Mark single attendance (admin)
- `POST /api/attendance/bulk` - Mark bulk attendance (admin)
- `DELETE /api/attendance/remove` - Remove attendance record (admin)
- `GET /api/users` - List users (admin)
- `GET /api/health` - Health check

## Project Structure

```
attendance-system/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Attendance.js
│   │   └── User.js
│   └── routes/
│       ├── auth.js
│       ├── attendance.js
│       └── users.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── public/
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        ├── context/
        ├── pages/
        └── utils/
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

## 🌐 Live Demo
http://3.110.148.250/

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
