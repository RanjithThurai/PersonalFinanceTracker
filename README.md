💰 Personal Finance Assistant
🎥 Project Demo
🚀 Live Demo: Click here

Description
A full-stack web application designed to help users track, manage, and understand their financial activities. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this app allows users to log income and expenses, categorize transactions, and visualize their spending habits through an interactive, multi-chart dashboard.

Shutterstock

✨ Features
Secure User Authentication: Full sign-up and login system using JSON Web Tokens (JWTs) for secure, session-based access.

Transaction Management: Users can easily add, view, and delete their personal income and expense records.

Interactive Dashboard: A dynamic dashboard with multiple charts to visualize financial data:

Total Income vs. Total Expense Bar Chart.

Horizontal Bar Chart for detailed spending by category.

Doughnut Chart for proportional expense breakdown.

Receipt Scanning: Users can upload an image of a receipt, and the application will use OCR (Optical Character Recognition) via Tesseract.js to automatically extract the total amount.

Data Filtering: The transaction list can be filtered by a specific date range.

Dual Theme: A persistent dark/light mode toggle for user comfort.

🛠️ Tech Stack
Frontend: React, React Router, Axios, Chart.js

Backend: Node.js, Express.js

Database: MongoDB (with Mongoose)

Authentication: JSON Web Tokens (JWT), bcrypt.js

File Handling: Multer (for uploads), Tesseract.js (for OCR)

📂 Project Structure
Plaintext

PersonalFinanceTracker/
├── backend/            # Express server, MongoDB models, and API routes
├── frontend/           # React application, components, and assets
├── render.yaml         # Configuration for Render deployment
├── vercel.json         # Configuration for Vercel deployment
└── netlify.toml        # Configuration for Netlify deployment
🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine.

Prerequisites
You must have the following software installed on your machine:

Node.js (includes npm)

Git

A free MongoDB Atlas account.

Installation & Setup
Clone the repository:

Bash

git clone https://github.com/RanjithThurai/PersonalFinanceTracker.git
cd PersonalFinanceTracker
Setup the Backend:

Navigate to the backend directory:

Bash

cd backend
npm install
Create a .env file in the backend root and add your details:

Code snippet

MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
JWT_SECRET=<YOUR_RANDOMLY_GENERATED_JWT_SECRET_KEY>
PORT=5000
FRONTEND_URL=http://localhost:3000
Start the backend server:

Bash

node server.js
Setup the Frontend:

Navigate to the frontend directory:

Bash

cd ../frontend
npm install
(Optional) Create a .env file in the frontend root:

Code snippet

REACT_APP_API_URL=http://localhost:5000/api
Start the development server:

Bash

npm start
🚀 Deployment
The project is pre-configured for modern hosting platforms:

Backend: Deploy to Render or Railway using the included render.yaml or Procfile.

Frontend: Deploy to Vercel or Netlify using vercel.json or netlify.toml.

Database: Use MongoDB Atlas.

👤 Author
Ranjith Thurai

GitHub: @RanjithThurai
