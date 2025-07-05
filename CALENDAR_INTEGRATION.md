# Calendar Integration Setup Guide

TaskSync AI supports integration with Google Calendar and Outlook Calendar for seamless two-way synchronization of events.

## 📋 Overview

The calendar integration allows you to:
- **Sync calendar events** from Google Calendar and Outlook
- **Two-way synchronization** - create, update, and delete events
- **AI-powered scheduling** that considers your existing calendar commitments
- **Multi-calendar support** - connect multiple calendar providers simultaneously
- **Real-time updates** with automatic refresh and conflict detection

## 🔧 Setup Instructions

### Google Calendar Integration

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API

2. **Configure OAuth 2.0**
   - Navigate to "Credentials" in the API & Services section
   - Create OAuth 2.0 Client ID credentials
   - Add your domain to authorized origins:
     ```
     http://localhost:5000
     https://your-domain.replit.app
     ```
   - Add redirect URI:
     ```
     http://localhost:5000/api/auth/google/callback
     https://your-domain.replit.app/api/auth/google/callback
     ```

3. **Set Environment Variables**
   ```bash
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

### Outlook Calendar Integration

1. **Create Azure App Registration**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "App registrations"
   - Create a new registration with these settings:
     - Name: "TaskSync AI Calendar Integration"
     - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"

2. **Configure API Permissions**
   - Add Microsoft Graph permissions:
     - `Calendars.ReadWrite` (Application/Delegated)
     - `offline_access` (Delegated)
   - Grant admin consent for your organization

3. **Generate Client Secret**
   - Go to "Certificates & secrets"
   - Create a new client secret
   - Copy the secret value (you won't see it again)

4. **Set Redirect URI**
   - Go to "Authentication"
   - Add platform "Web"
   - Add redirect URI:
     ```
     http://localhost:5000/api/auth/outlook/callback
     https://your-domain.replit.app/api/auth/outlook/callback
     ```

5. **Set Environment Variables**
   ```bash
   OUTLOOK_CLIENT_ID=your_outlook_client_id
   OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
   OUTLOOK_REDIRECT_URI=http://localhost:5000/api/auth/outlook/callback
   ```

## 🚀 Usage

### Connecting Calendars

1. Navigate to Settings page (`/settings`)
2. Find the "Calendar Integrations" section
3. Click "Connect" for your desired calendar provider
4. Complete the OAuth authorization flow
5. Your calendar will now sync automatically

### Managing Integrations

- **Enable/Disable Sync**: Use the toggle switch to activate or pause synchronization
- **Manual Sync**: Click the "Sync" button to force a refresh
- **Disconnect**: Remove calendar integration entirely

### AI-Powered Features

Once calendars are connected, TaskSync AI will:
- **Analyze your schedule** to find optimal time slots for tasks
- **Suggest time blocks** for focused work based on your calendar availability
- **Avoid scheduling conflicts** by checking existing commitments
- **Optimize daily plans** considering both tasks and calendar events

## 🔄 API Endpoints

### Authentication Endpoints
```
GET /api/auth/google              # Initiate Google OAuth
GET /api/auth/google/callback     # Google OAuth callback
GET /api/auth/outlook             # Initiate Outlook OAuth  
GET /api/auth/outlook/callback    # Outlook OAuth callback
```

### Integration Management
```
GET /api/calendar/integrations           # List connected calendars
POST /api/calendar/integrations          # Add new integration
PATCH /api/calendar/integrations/:id     # Update integration settings
DELETE /api/calendar/integrations/:id    # Remove integration
POST /api/calendar/integrations/:id/sync # Force sync calendar
```

### Event Synchronization
```
GET /api/calendar/events                 # Get all synchronized events
POST /api/calendar/events                # Create new event
PATCH /api/calendar/events/:id          # Update existing event
DELETE /api/calendar/events/:id         # Delete event
```

## 🔒 Security & Privacy

- **OAuth 2.0 Authentication**: Secure authorization flow with refresh tokens
- **Token Encryption**: All access tokens are encrypted in the database
- **Minimal Permissions**: Only requests necessary calendar read/write permissions
- **Data Privacy**: Calendar data stays within your TaskSync AI instance
- **Automatic Token Refresh**: Seamless background token renewal

## 🛠️ Database Schema

The calendar integration uses these database tables:

```sql
-- Calendar provider connections
CREATE TABLE calendar_integrations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  provider VARCHAR NOT NULL, -- 'google', 'outlook'
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Synchronized calendar events
CREATE TABLE calendar_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  external_id VARCHAR, -- Provider's event ID
  title VARCHAR NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR,
  source VARCHAR NOT NULL, -- 'google', 'outlook', 'manual'
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚨 Troubleshooting

### Common Issues

**"Authorization failed"**
- Check that redirect URIs match exactly in provider settings
- Verify client ID and secret are correct
- Ensure the correct scopes are requested

**"Token expired"**
- The system should auto-refresh tokens
- Try disconnecting and reconnecting the calendar
- Check that refresh tokens are being stored properly

**"Events not syncing"**
- Verify the integration is active (toggle switch on)
- Check the last sync timestamp
- Try manual sync to test connectivity

**"Calendar events missing"**
- Check date range filters in calendar view
- Verify time zone settings match your calendar
- Ensure calendar has the necessary permissions

### Support

For additional help:
1. Check browser console for error messages
2. Review server logs for API errors
3. Verify all environment variables are set correctly
4. Test OAuth flows in incognito/private browsing mode

## 🔮 Future Enhancements

Planned features:
- **Apple Calendar** integration (CalDAV)
- **Multiple calendar selection** per provider
- **Calendar-specific AI preferences**
- **Automated event creation** from task deadlines
- **Smart conflict resolution** with user preferences
- **Bulk event operations** for efficient management