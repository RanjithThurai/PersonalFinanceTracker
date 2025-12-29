💰 Personal Finance Assistant
🎥 Project Demo

🚀 Live Demo:
👉 [Click here](https://personal-finance-tracker-fro-git-b29e77-ranjiththurais-projects.vercel.app)
📌 Description

A full-stack web application designed to help users track, manage, and understand their financial activities. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this app allows users to log income and expenses, categorize transactions, scan receipts, manage budgets, and visualize spending patterns through an interactive dashboard.

✨ Features
🔐 Secure User Authentication

User registration with email & password validation

Secure login using JWT-based authentication

Password hashing using bcrypt.js

Protected routes with authentication middleware

Token expiration and session handling

💰 Transaction Management

Add income and expense transactions

Fields: amount, description, category, date

View all transactions in an organized list

Delete transactions with confirmation

Predefined categories (Food, Transport, Entertainment, Bills, etc.)

Support for both income and expense entries

Filter transactions by date range and category

Search transactions by description or amount

📊 Interactive Dashboard & Analytics

Real-time financial overview dashboard

Bar Chart – Income vs Expenses comparison

Doughnut Chart – Expense breakdown by category

Horizontal Bar Chart – Category-wise spending analysis

Line Chart – Spending trends over time

Summary statistics:

Total income

Total expenses

Current balance

Charts update automatically when data changes

📅 Monthly & Yearly View Toggle

Monthly transaction view

Yearly financial summary

Smooth toggle between monthly and yearly views

Dynamic year selector (from 2020 to current year)

Month selector appears only in monthly view

Optimized API calls based on selected view

📸 Receipt Scanning (OCR)

Upload receipt images (JPG, PNG, PDF)

OCR processing using Tesseract.js

Automatic amount extraction from receipts

Manual correction option before saving

Convert receipts directly into transactions

File type and size validation

Loading and progress indicators during scanning

🎯 Budget Management

Create monthly budgets by category

Real-time budget tracking

Overspending alerts

Visual progress bars for budget usage

Budget vs actual spending comparison

Automatic monthly budget reset

🎨 User Experience

Fully responsive design (mobile, tablet, desktop)

Persistent dark / light theme toggle

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

MongoDB (with Mongoose)

Authentication & Security

JSON Web Tokens (JWT)

bcrypt.js

File Handling & OCR

Multer

Tesseract.js

🚀 Getting Started
Prerequisites

Node.js (with npm)

Git

MongoDB Atlas account

Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/RanjithThurai/PersonalFinanceTracker.git
cd personal-finance-assistant

2️⃣ Backend Setup
cd backend
npm install


Create a .env file in the backend directory:

MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
JWT_SECRET=<YOUR_JWT_SECRET>
PORT=5000
FRONTEND_URL=http://localhost:3000


Start the backend server:

node server.js

3️⃣ Frontend Setup
cd frontend
npm install


(Optional) Create a .env file:

REACT_APP_API_URL=http://localhost:5000/api


Start the frontend server:

npm start

🚀 Deployment

Frontend: Vercel / Netlify

Backend: Render / Railway

Database: MongoDB Atlas

Deployment Configuration Files

vercel.json

netlify.toml

render.yaml

Procfile

🏁 Conclusion

This Personal Finance Assistant is a feature-rich, secure, and scalable MERN stack application that demonstrates real-world implementation of authentication, data visualization, OCR, budgeting, and responsive UI design.
- `netlify.toml` - For Netlify deployment
- `Procfile` - For Heroku/Railway deployment
