# 🚀 Deployment Guide

This guide will help you deploy the Personal Finance Tracker application to production.

## 📋 Prerequisites

1. **MongoDB Atlas Account**: Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **GitHub Account**: For version control and deployment
3. **Accounts on deployment platforms** (choose based on your preference):
   - **Render** (recommended for backend) - [render.com](https://render.com)
   - **Vercel** (recommended for frontend) - [vercel.com](https://vercel.com)
   - **Netlify** (alternative for frontend) - [netlify.com](https://netlify.com)

## 🗄️ Step 1: Setup MongoDB Atlas

1. Create a new cluster on MongoDB Atlas
2. Create a database user (username/password)
3. Whitelist IP addresses (use `0.0.0.0/0` for all IPs during development)
4. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
5. Save this connection string - you'll need it for deployment

## 🔧 Step 2: Generate JWT Secret

Generate a random secret key for JWT authentication:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))"
```

Save this secret - you'll need it for the backend environment variables.

## 🌐 Step 3: Deploy Backend (Render - Recommended)

### Option A: Using Render Dashboard

1. **Sign up/Login** to [Render](https://render.com)
2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Name**: `personal-finance-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Root Directory**: Leave empty (or set to `backend` if needed)

3. **Set Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your generated JWT secret
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Render will override this, but include it)
   - `FRONTEND_URL`: Your frontend URL (set after deploying frontend)

4. **Deploy**: Click "Create Web Service"

5. **Note the URL**: Render will provide a URL like `https://your-app.onrender.com`

### Option B: Using render.yaml (Infrastructure as Code)

1. The `render.yaml` file is already configured
2. Push your code to GitHub
3. In Render dashboard, select "New" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and create the service
6. Set the environment variables in the Render dashboard

## 🎨 Step 4: Deploy Frontend

### Option A: Deploy to Vercel (Recommended)

1. **Sign up/Login** to [Vercel](https://vercel.com)
2. **Import Project**:
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Framework Preset**: `Create React App`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Set Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add a new variable:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: Your backend URL (e.g., `https://your-app.onrender.com/api`)
     - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

4. **Deploy**: Click "Deploy"

5. **Note the URL**: Vercel will provide a URL like `https://your-app.vercel.app`

### Option B: Deploy to Netlify

1. **Sign up/Login** to [Netlify](https://netlify.com)
2. **New Site from Git**:
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/build`

3. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add `REACT_APP_API_URL`: Your backend URL

4. **Deploy**: Click "Deploy site"

5. **Note the URL**: Netlify will provide a URL like `https://your-app.netlify.app`

## 🔄 Step 5: Update CORS Settings

After deploying the frontend, update the backend's `FRONTEND_URL` environment variable:

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to Environment variables
4. Update `FRONTEND_URL` to your frontend URL (e.g., `https://your-app.vercel.app`)
5. Redeploy the backend service

## ✅ Step 6: Verify Deployment

1. Visit your frontend URL
2. Try signing up for a new account
3. Add a transaction
4. Verify all features work correctly

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong JWT secrets** - Generate random, long strings
3. **Restrict MongoDB IP whitelist** - After deployment, update MongoDB Atlas to only allow your Render IP
4. **Use HTTPS** - Both Vercel and Render provide HTTPS by default
5. **Regular updates** - Keep dependencies updated

## 🐛 Troubleshooting

### Backend Issues

- **Connection timeout**: Check MongoDB Atlas IP whitelist
- **CORS errors**: Verify `FRONTEND_URL` matches your frontend domain exactly
- **Build failures**: Check Node.js version compatibility

### Frontend Issues

- **API calls failing**: Verify `REACT_APP_API_URL` is set correctly
- **Build errors**: Check for environment variable typos
- **Blank page**: Check browser console for errors

## 📝 Alternative Deployment Options

### Backend Alternatives

- **Railway**: [railway.app](https://railway.app) - Similar to Render
- **Heroku**: [heroku.com](https://heroku.com) - Requires credit card for free tier
- **DigitalOcean App Platform**: [digitalocean.com](https://digitalocean.com)

### Frontend Alternatives

- **GitHub Pages**: Free static hosting (requires build step)
- **Firebase Hosting**: [firebase.google.com](https://firebase.google.com)
- **AWS Amplify**: [aws.amazon.com/amplify](https://aws.amazon.com/amplify)

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:
- Every push to `main` branch triggers a new deployment
- Pull requests create preview deployments (Vercel)

## 📞 Need Help?

- Check platform-specific documentation
- Review error logs in deployment dashboards
- Ensure all environment variables are set correctly

