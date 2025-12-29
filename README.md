# 💰 Personal Finance Assistant

### 🎥 Project Demo
**🚀 Live Demo:** [Click here]([https://netlify.app](https://personal-finance-tracker-fro-git-b29e77-ranjiththurais-projects.vercel.app?_vercel_share=k96wCBORNl2gYazWIDyVOrB8VoLgynWz)

### 📝 Description
A full-stack web application designed to help users track, manage, and understand their financial activities. Built with the **MERN stack** (MongoDB, Express.js, React, Node.js), this app allows users to log income and expenses, categorize transactions, and visualize spending habits through an interactive dashboard.

---

## ✨ Features

* **Secure User Authentication**: Full sign-up and login system using **JSON Web Tokens (JWTs)** for secure, session-based access.
* **Transaction Management**: Users can easily add, view, and delete their personal income and expense records.
* **Interactive Dashboard**: A dynamic dashboard with multiple charts to visualize financial data:
    * Total Income vs. Total Expense Bar Chart.
    * Horizontal Bar Chart for detailed spending by category.
    * Doughnut Chart for proportional expense breakdown.
* **Receipt Scanning**: Users can upload an image of a receipt, and the application will use **OCR** (Optical Character Recognition) via **Tesseract.js** to automatically extract the total amount.
* **Data Filtering**: The transaction list can be filtered by a specific date range.
* **Dual Theme**: A persistent dark/light mode toggle for user comfort.

---

## 🛠️ Tech Stack

* **Frontend**: React, React Router, Axios, Chart.js
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (with Mongoose)
* **Authentication**: JSON Web Tokens (JWT), bcrypt.js
* **File Handling**: Multer (for uploads), Tesseract.js (for OCR)

---

## 📂 Project Structure

```
PersonalFinanceTracker/
├── backend/            # Express server, MongoDB models, and API routes
├── frontend/           # React application, components, and assets
├── render.yaml         # Configuration for Render deployment
├── vercel.json         # Configuration for Vercel deployment
└── netlify.toml        # Configuration for Netlify deployment
```
## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.
### Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/en/) (includes npm)
* [Git](https://git-scm.com/)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and a connection string.

---

## 💻 Installation & Setup

### 1. Clone the Repository
bash
git clone [https://github.com/RanjithThurai/PersonalFinanceTracker.git](https://github.com/RanjithThurai/PersonalFinanceTracker.git)
cd PersonalFinanceTracker
2. Setup the Backend
Navigate to the backend directory, install dependencies, and configure your environment variables.

Bash

cd backend
npm install
Create a .env file in the /backend folder and add your credentials:

Code snippet

MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
JWT_SECRET=<YOUR_RANDOMLY_GENERATED_JWT_SECRET_KEY>
PORT=5000
FRONTEND_URL=http://localhost:3000
Start the backend server:

Bash

node server.js
3. Setup the Frontend
Open a new terminal window, navigate to the frontend directory, and start the React app.

Bash

cd frontend
npm install
npm start
```
🌐 Deployment
The project is pre-configured for modern hosting platforms. You can find specific configuration files in the root directory:

Backend: Deploy to Render or Railway using the included render.yaml or Procfile.

Frontend: Deploy to Vercel or Netlify using vercel.json or netlify.toml.

Database: Use MongoDB Atlas for managed cloud storage.
```
🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request
```
👤 Author
Ranjith Thurai

GitHub: @RanjithThurai
```
📝 Conclusion
This Personal Finance Assistant is designed to provide users with a seamless way to manage their money. From secure logins to advanced OCR receipt scanning, it bridges the gap between manual entry and automated financial tracking.
```
