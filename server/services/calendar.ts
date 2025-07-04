import { google } from 'googleapis';
import { storage } from '../storage';

export async function syncGoogleCalendar(userId: string, accessToken: string): Promise<void> {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get events for the next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: thirtyDaysFromNow.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Store events in database
    for (const event of events) {
      if (!event.start?.dateTime || !event.end?.dateTime) continue;
      
      try {
        await storage.createCalendarEvent(userId, {
          externalId: event.id || '',
          title: event.summary || 'Untitled Event',
          description: event.description || '',
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end.dateTime),
          location: event.location || '',
          source: 'google',
          isAiGenerated: false,
        });
      } catch (error) {
        // Event might already exist, continue with next event
        console.log(`Event ${event.id} already exists or failed to create`);
      }
    }
    
    console.log(`Synced ${events.length} events from Google Calendar for user ${userId}`);
  } catch (error) {
    console.error('Error syncing Google Calendar:', error);
    throw new Error('Failed to sync Google Calendar: ' + (error as Error).message);
  }
}
