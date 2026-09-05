# Sakil Hub - Medusa.js Backend & PostgreSQL Setup Guide

This guide details the step-by-step instructions for setting up the **Medusa.js headless commerce backend** with **PostgreSQL** running via Docker for Sakil Hub.

---

## 📋 Prerequisites

- **Docker Desktop** installed and running.
- **Node.js** (v18 or v20+ recommended).
- **npm**, **pnpm**, or **yarn**.

---

## 🚀 Step 1: Start the Local PostgreSQL Database

From the root directory (`Sakil Hub/`), start the PostgreSQL container:

```bash
docker-compose up -d
```

To verify that PostgreSQL is running:

```bash
docker ps
```

You should see `sakil-hub-postgres` running on port `5432`.

---

## 📦 Step 2: Initialize the Medusa.js Backend

Open your terminal in the project root and create the `backend` folder with Medusa:

```bash
# Initialize Medusa v2 / latest into a 'backend' folder
npx create-medusa-app@latest backend
```

> **Note:** During the interactive prompt, when asked for the Database URL, provide:
> `postgres://postgres:postgres@localhost:5432/sakil_hub_db`

---

## ⚙️ Step 3: Configure Environment Variables

Inside the newly created `backend/` directory, create or edit the `.env` file with the following configuration:

```env
# PostgreSQL Database Connection
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sakil_hub_db

# Security & Secrets (Replace with random secure strings)
JWT_SECRET=supersecret_jwt_sakilhub_2026_key
COOKIE_SECRET=supersecret_cookie_sakilhub_2026_key

# CORS Configuration
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001,http://localhost:9000,http://localhost:5173
AUTH_CORS=http://localhost:3000,http://localhost:7001,http://localhost:9000

# Backend Server URL
MEDUSA_BACKEND_URL=http://localhost:9000
```

---

## 🔄 Step 4: Run Database Migrations

Navigate into the `backend/` folder and execute the database migrations:

```bash
cd backend

# Run migrations
npx medusa db:migrate
# or
npx medusa migrations run
```

---

## 👤 Step 5: Create an Admin User

Create your admin credentials to access the Medusa Admin Dashboard:

```bash
npx medusa user --email admin@sakilhub.com --password supersecretadminpassword
```

---

## ▶️ Step 6: Start the Medusa Backend Server

Start the development server:

```bash
npm run dev
# or
npx medusa develop
```

The Medusa server and Admin dashboard will be accessible at:
- **Backend API**: `http://localhost:9000`
- **Admin Dashboard**: `http://localhost:9000/app` or `http://localhost:7001`

---

## 🔗 Step 7: Connect the Next.js Frontend

In your root frontend directory (`Sakil Hub/`), add a `.env.local` file:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

Now your Next.js frontend (running at `http://localhost:3000`) is ready to interact with your Medusa headless commerce backend!
