# OmniHub Deployment & Operations Guide

## 1. Local Development
```bash
npm install
npm run seed
npm run dev
```

## 2. Production Docker Deployment
```bash
docker-compose up -d --build
```

## 3. Environment Variables (.env)
- `PORT`: Server HTTP port (default 5000)
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Upstash or local Redis URL
- `JWT_SECRET`: Secret key for signing tokens
- `GEMINI_API_KEY`: Google Gemini AI API key
