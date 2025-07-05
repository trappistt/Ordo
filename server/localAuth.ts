import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

// Extend session interface for local development
declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: any;
  }
}

export function getLocalSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local development
      maxAge: sessionTtl,
    },
  });
}

export async function setupLocalAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getLocalSession());

  // Auto-login middleware for local development
  app.use((req, res, next) => {
    if (!req.session.userId) {
      // Auto-create a demo user for local development
      req.session.userId = "local-user";
      req.session.user = {
        id: "local-user",
        email: "local@smartscheduler.com",
        firstName: "Local",
        lastName: "User",
        profileImageUrl: null,
      };
    }
    next();
  });

  // Auth routes for local development
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Return a simple user object for local development
      const user = {
        id: userId,
        email: "local@smartscheduler.com",
        firstName: "Local",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/login", (req, res) => {
    // Auto-login for local development
    req.session.userId = "local-user";
    req.session.user = {
      id: "local-user",
      email: "local@smartscheduler.com",
      firstName: "Local",
      lastName: "User",
    };
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Set user in request for consistency with Replit auth
  req.user = {
    claims: {
      sub: userId,
      email: "local@smartscheduler.com",
      first_name: "Local",
      last_name: "User"
    }
  };

  return next();
}; 