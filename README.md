💰 Personal Finance Assistant
🎥 Project Demo

🚀 Live Demo:
👉 https://personal-finance-tracker-fro-git-b29e77-ranjiththurais-projects.vercel.app

📌 Description

A full-stack web application designed to help users track, manage, and understand their financial activities.
Built with the MERN stack (MongoDB, Express.js, React, Node.js), this application allows users to log income and expenses, categorize transactions, scan receipts, manage budgets, and visualize spending habits through an interactive dashboard.

✨ Features
🔐 Secure User Authentication

User sign-up and login using JSON Web Tokens (JWT)

Password hashing with bcrypt.js

Protected routes with authentication middleware

Secure session and token expiration handling

💰 Transaction Management

Add income and expense transactions

Fields: amount, description, category, date

View and delete transactions

Predefined categories (Food, Transport, Entertainment, Bills, etc.)

Search transactions by description or amount

Filter transactions by date range and category

📊 Interactive Dashboard & Analytics

Real-time financial dashboard

Income vs Expense Bar Chart

Category-wise Horizontal Bar Chart

Expense distribution Doughnut Chart

Spending trend Line Chart

Summary metrics:

Total income

Total expenses

Current balance

Automatic chart updates on data changes

📅 Monthly & Yearly View

Monthly transaction view

Yearly financial summary

Smooth toggle between monthly and yearly views

Dynamic year selector (2020 to current year)

Month selector visible only in monthly mode

📸 Receipt Scanning (OCR)

Upload receipt images (JPG, PNG, PDF)

OCR using Tesseract.js

Automatic amount extraction

Manual correction before saving

Convert receipts directly into transactions

🎯 Budget Management

Create monthly budgets by category

Track real-time budget usage

Overspending alerts

Visual budget progress indicators

Automatic monthly budget reset

🎨 User Experience

Fully responsive design (mobile, tablet, desktop)

Persistent dark/light theme toggle

Smooth animations and transitions

Skeleton loaders and spinners

Real-time form validation

User-friendly error handling

🛠️ Tech Stack

Frontend

React

React Router

Axios

Chart.js

Backend

Node.js

Express.js

Database

MongoDB (Mongoose)

Authentication & Security

JWT (JSON Web Tokens)

bcrypt.js

File Handling & OCR

Multer

Tesseract.js

🚀 Getting Started
Prerequisites

Node.js (npm included)

Git

MongoDB Atlas account

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/RanjithThurai/PersonalFinanceTracker.git
cd personal-finance-assistant

2️⃣ Backend Setup
cd backend
npm install


Create a .env file in the backend directory:

MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
PORT=5000
FRONTEND_URL=http://localhost:3000


Start the backend server:

node server.js

3️⃣ Frontend Setup
cd frontend
npm install


(Optional) .env file:

REACT_APP_API_URL=http://localhost:5000/api


Start the frontend server:

npm start

🚀 Deployment

Frontend: Vercel / Netlify

Backend: Render / Railway

Database: MongoDB Atlas

Deployment Files Included

vercel.json

netlify.toml

render.yaml

Procfile

🏁 Conclusion

Personal Finance Assistant is a secure, scalable, and feature-rich MERN stack application demonstrating real-world implementation of authentication, financial data management, analytics, OCR integration, budgeting, and responsive UI design.
