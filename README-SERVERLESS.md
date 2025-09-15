# BGM Referral System - Serverless Setup

## Development Setup

### Option 1: Run Everything Together (Recommended)
```bash
npm run dev
```
This will start:
- React frontend on http://localhost:3000
- Vercel serverless functions on http://localhost:3001

### Option 2: Run Separately
```bash
# Terminal 1: React Frontend
npm run start
# Frontend will be available at http://localhost:3000

# Terminal 2: Serverless Functions
npm run serverless
# API will be available at http://localhost:3001
```

## Environment Variables

Make sure you have these environment variables set in `.env.local`:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/bgm_referral
JWT_SECRET=your-super-secure-jwt-secret-here
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

All API endpoints are available at `http://localhost:3001/api/`:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/referral/[code]` - Handle referral links
- `POST /api/referral/success` - Process referral success

## Production Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Port Configuration

- Frontend (React): Port 3000
- API (Vercel): Port 3001
- Backend (if needed): Port 5000+