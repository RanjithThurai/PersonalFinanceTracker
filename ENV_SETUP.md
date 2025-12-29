# Environment Variables Setup

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection String (from MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Secret Key (generate a random string)
# You can generate one using: openssl rand -base64 32
JWT_SECRET=your_random_jwt_secret_key_here

# Server Port (default: 5000)
PORT=5000

# Frontend URL (for CORS - update this after deploying frontend)
FRONTEND_URL=http://localhost:3000
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory (optional for local development):

```env
# Backend API URL
# For local development: http://localhost:5000/api
# For production: https://your-backend-url.onrender.com/api
REACT_APP_API_URL=http://localhost:5000/api
```

## Generating JWT Secret

### Linux/Mac:
```bash
openssl rand -base64 32
```

### Windows (PowerShell):
```powershell
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))"
```

## Important Notes

- Never commit `.env` files to version control (they're already in `.gitignore`)
- For production deployment, set these variables in your hosting platform's dashboard
- The `REACT_APP_` prefix is required for React to access environment variables
- After deploying, update `FRONTEND_URL` in the backend to match your production frontend URL

