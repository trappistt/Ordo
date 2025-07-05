import fetch from 'node-fetch';
import type { CalendarEvent, InsertCalendarEvent } from '@shared/schema';

export class OutlookCalendarService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.OUTLOOK_CLIENT_ID || '';
    this.clientSecret = process.env.OUTLOOK_CLIENT_SECRET || '';
    this.redirectUri = process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/outlook/callback';
  }

  getAuthUrl(): string {
    const scopes = 'https://graph.microsoft.com/calendars.readwrite offline_access';
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      response_mode: 'query'
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string) {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return await response.json();
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    return await response.json();
  }

  async getCalendarEvents(accessToken: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      $select: 'id,subject,body,start,end,location',
      $orderby: 'start/dateTime'
    });

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendarview?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Outlook Calendar events');
    }

    const data = await response.json();
    const events = data.value || [];

    return events.map((event: any) => ({
      externalId: event.id,
      title: event.subject || 'Untitled Event',
      description: event.body?.content || '',
      startTime: new Date(event.start.dateTime),
      endTime: new Date(event.end.dateTime),
      location: event.location?.displayName || '',
      source: 'outlook' as const,
      isAiGenerated: false,
    }));
  }

  async createCalendarEvent(accessToken: string, event: InsertCalendarEvent): Promise<any> {
    const eventData = {
      subject: event.title,
      body: {
        contentType: 'Text',
        content: event.description
      },
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'UTC'
      },
      location: {
        displayName: event.location
      }
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      throw new Error('Failed to create Outlook Calendar event');
    }

    return await response.json();
  }

  async updateCalendarEvent(accessToken: string, eventId: string, updates: Partial<InsertCalendarEvent>): Promise<any> {
    const eventData: any = {};
    
    if (updates.title) eventData.subject = updates.title;
    if (updates.description) {
      eventData.body = {
        contentType: 'Text',
        content: updates.description
      };
    }
    if (updates.location) {
      eventData.location = {
        displayName: updates.location
      };
    }
    if (updates.startTime) {
      eventData.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: 'UTC'
      };
    }
    if (updates.endTime) {
      eventData.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: 'UTC'
      };
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      throw new Error('Failed to update Outlook Calendar event');
    }

    return await response.json();
  }

  async deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete Outlook Calendar event');
    }
  }
}

export const outlookCalendarService = new OutlookCalendarService();