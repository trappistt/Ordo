import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Please check your .env file.");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set. Please check your .env file.");
}

export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  session: {
    secret: process.env.SESSION_SECRET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  },
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    redirectUri: process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/outlook/callback',
  },
}; 