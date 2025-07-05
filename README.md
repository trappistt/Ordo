# SmartScheduler - AI-Powered Task Management

A modern task management and scheduling application with AI-powered features, calendar integration, and intelligent planning capabilities.

## 🚀 Features

- **Smart Task Management**: Create, edit, delete, and complete tasks with intelligent categorization
- **Multi-Calendar Sync**: Connect Google, Outlook, and Apple calendars for unified scheduling
- **AI-Powered Planning**: Let AI analyze your workload and suggest optimal scheduling
- **Intelligent Optimization**: Automatic task scheduling based on priorities and energy patterns
- **Team Collaboration**: Share schedules and coordinate with team members
- **Time Tracking**: Monitor productivity and get insights to improve efficiency

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with OAuth support
- **AI Integration**: OpenAI API for intelligent suggestions
- **Calendar**: Google Calendar & Outlook integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/trappistt/Ordo.git
   cd Ordo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Configuration
SESSION_SECRET=your-super-secret-session-key

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key

# Google Calendar Integration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Outlook Calendar Integration (optional)
OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret
OUTLOOK_REDIRECT_URI=https://yourdomain.com/api/auth/outlook/callback
```

## 🚀 Deployment

### Option 1: Render (Recommended)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Set environment variables** in Render dashboard
4. **Deploy automatically** on push to main branch

### Option 2: Railway

1. **Connect your GitHub repository to Railway**
2. **Add PostgreSQL database** from Railway dashboard
3. **Set environment variables**
4. **Deploy automatically**

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Create Heroku app**
3. **Add PostgreSQL addon**
4. **Set environment variables**
5. **Deploy with Git**

## 📁 Project Structure

```
SmartScheduler/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
├── server/                 # Express backend
│   ├── services/          # External service integrations
│   ├── routes/            # API routes
│   └── storage.ts         # Database operations
├── shared/                # Shared types and schemas
└── scripts/               # Setup and utility scripts
```

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Login endpoint
- `GET /api/logout` - Logout endpoint

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/toggle` - Toggle completion

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `GET /api/calendar/integrations` - Get integrations

### AI Features
- `POST /api/ai/generate-plan` - Generate AI plan
- `GET /api/ai/plan/:date` - Get AI plan

### Preferences
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Update preferences

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run check` - TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the database is accessible and schema is created
4. Open an issue on GitHub

## 🔗 Links

- [Live Demo](https://your-app-url.com)
- [Documentation](https://your-docs-url.com)
- [Issues](https://github.com/trappistt/Ordo/issues) 