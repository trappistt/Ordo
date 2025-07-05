# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for SmartScheduler.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "SmartScheduler")
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API" and then "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: SmartScheduler
   - User support email: your email
   - Developer contact information: your email
   - Save and continue through the steps

4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: SmartScheduler Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for local development)
     - `https://your-domain.com/api/auth/google/callback` (for production)
   - Click "Create"

5. Copy the Client ID and Client Secret

## Step 4: Update Environment Variables

Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

For production, update the redirect URI to your domain.

## Step 5: Test the Integration

1. Start your application
2. Sign in to your account
3. Go to Settings > Calendar Integration
4. Click "Connect Google Calendar"
5. Authorize the application
6. You should see "Google Calendar connected successfully"

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Access denied" error**
   - Make sure you've enabled the Google Calendar API
   - Check that your OAuth consent screen is properly configured

3. **"Client ID not found" error**
   - Verify your environment variables are set correctly
   - Restart your application after changing environment variables

### For Production Deployment:

1. Update the redirect URI in Google Cloud Console to your production domain
2. Update the `GOOGLE_REDIRECT_URI` environment variable
3. Make sure your domain is added to authorized origins

## Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor your API usage in Google Cloud Console

## API Limits

Google Calendar API has the following limits:
- 1,000,000,000 queries per day per project
- 10,000 queries per 100 seconds per user
- 10,000 queries per 100 seconds per IP address

These limits should be sufficient for most use cases. 