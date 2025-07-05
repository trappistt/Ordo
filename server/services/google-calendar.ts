import { google } from 'googleapis';
import type { CalendarEvent, InsertCalendarEvent } from '@shared/schema';

export class GoogleCalendarService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
    );
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code: string) {
    const { tokens } = await this.oauth2Client.getAccessToken(code);
    return tokens;
  }

  async setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async refreshAccessToken(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  async getCalendarEvents(accessToken: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      
      return events.map((event: any) => ({
        externalId: event.id,
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        startTime: new Date(event.start?.dateTime || event.start?.date),
        endTime: new Date(event.end?.dateTime || event.end?.date),
        location: event.location || '',
        source: 'google' as const,
        isAiGenerated: false,
      }));
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw new Error('Failed to fetch Google Calendar events');
    }
  }

  async createCalendarEvent(accessToken: string, event: InsertCalendarEvent): Promise<any> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const eventData = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'America/New_York',
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error('Failed to create Google Calendar event');
    }
  }

  async updateCalendarEvent(accessToken: string, eventId: string, updates: Partial<InsertCalendarEvent>): Promise<any> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const eventData: any = {};
    if (updates.title) eventData.summary = updates.title;
    if (updates.description) eventData.description = updates.description;
    if (updates.location) eventData.location = updates.location;
    if (updates.startTime) {
      eventData.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: 'America/New_York',
      };
    }
    if (updates.endTime) {
      eventData.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: 'America/New_York',
      };
    }

    try {
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: eventData,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw new Error('Failed to update Google Calendar event');
    }
  }

  async deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw new Error('Failed to delete Google Calendar event');
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();