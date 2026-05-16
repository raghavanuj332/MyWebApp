Here is the drive link of the walk-through video - https://drive.google.com/file/d/1AIcBeU9lSmJkUZ_CZW3b32u9X3C6cpVo/view?usp=sharing
# Team Task Manager (Full-Stack)

A full-stack Team Task Manager web application where users can create projects, assign tasks, track progress, and manage teams with role-based access control (Admin/Member).

---

# Live Demo

Frontend URL: https://your-frontend-url.up.railway.app

Backend URL: https://your-backend-url.up.railway.app

---

# GitHub Repository

Frontend + Backend Repository:
https://github.com/your-username/team-task-manager

---

# Features

## Authentication
- User Signup
- User Login
- JWT Authentication
- Password Hashing using bcrypt

---

## Role-Based Access Control

### Admin
- Create Projects
- Create Tasks
- Assign Tasks to Members
- View All Tasks
- Manage Project Tasks

### Member
- View Assigned Tasks
- Update Task Status
- Track Progress

---

## Dashboard
- Total Tasks
- Completed Tasks
- Pending Tasks
- Overdue Tasks

---

# Tech Stack

## Frontend
- React
- Vite
- TailwindCSS
- React Router DOM
- Axios

## Backend
- Node.js
- Express.js

## Database
- PostgreSQL

## ORM
- Prisma ORM

## Authentication
- JWT
- bcryptjs

## Deployment
- Railway

---

# Folder Structure

```bash
team-task-manager/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── prisma/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# Database Schema

## User
| Field | Type |
|------|------|
| id | Int |
| name | String |
| email | String |
| password | String |
| role | ADMIN / MEMBER |

---

## Project
| Field | Type |
|------|------|
| id | Int |
| title | String |
| description | String |
| createdBy | Int |

---

## Task
| Field | Type |
|------|------|
| id | Int |
| title | String |
| description | String |
| status | PENDING / IN_PROGRESS / COMPLETED |
| dueDate | DateTime |
| projectId | Int |
| assignedTo | Int |

---

# API Endpoints

## Authentication Routes

### Signup
```http
POST /api/auth/signup
```

### Login
```http
POST /api/auth/login
```

---

## Project Routes

### Create Project
```http
POST /api/projects
```

### Get All Projects
```http
GET /api/projects
```

---

## Task Routes

### Create Task
```http
POST /api/tasks
```

### Get Tasks
```http
GET /api/tasks
```

### Update Task Status
```http
PUT /api/tasks/:id
```

---

# Environment Variables

## Backend (.env)

Create a `.env` file inside the `server` folder.

```env
PORT=5000

DATABASE_URL="your_postgresql_database_url"

JWT_SECRET="your_secret_key"
```

---

# Installation & Setup

# 1. Clone Repository

```bash
git clone https://github.com/your-username/team-task-manager.git
```

---

# 2. Navigate to Project Folder

```bash
cd team-task-manager
```

---

# 3. Setup Backend

```bash
cd server
npm install
```

---

# 4. Initialize Prisma

```bash
npx prisma init
```

---

# 5. Run Prisma Migration

```bash
npx prisma migrate dev --name init
```

---

# 6. Generate Prisma Client

```bash
npx prisma generate
```

---

# 7. Start Backend Server

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 8. Setup Frontend

Open a new terminal.

```bash
cd client
npm install
```

---

# 9. Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Railway Deployment Guide

# Backend Deployment

## 1. Push Project to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

---

## 2. Create Railway Project

- Go to Railway
- Create New Project
- Select "Deploy from GitHub Repo"

---

## 3. Add PostgreSQL Database

- Click "New"
- Add PostgreSQL

---

## 4. Add Environment Variables

Inside Railway backend service:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
PORT=5000
```

---

## 5. Deploy Backend

Railway automatically deploys the backend.

---

# Frontend Deployment

## 1. Create New Railway Service

Deploy the `client` folder.

---

## 2. Add Frontend Environment Variable

```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

---

## 3. Deploy Frontend

Railway automatically deploys frontend.

---

# Seed Demo Data (Optional)

Run seed script:

```bash
npx prisma db seed
```

---

# Future Improvements

- Task Comments
- Email Notifications
- File Uploads
- Activity Logs
- Team Invitations
- Dark Mode
- Drag & Drop Kanban Board

---

# Author

Your Name

---

# License

This project is licensed under the MIT License.
