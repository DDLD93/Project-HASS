const { google } = require('googleapis');
const UserModel = require('../model/auth.model');

class GoogleController {
    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        )
    }

    async authorize(id,code) {
        try {
            const { tokens } = await this.oAuth2Client.getToken(code);
            const expiry_date = new Date().getTime() + (tokens.expires_in * 1000);
            const newToken = {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: expiry_date,
            };
            await UserModel.findByIdAndUpdate(id, { token: newToken });
            oAuth2Client.setCredentials(newToken);
            return oAuth2Client;
        } catch (error) {
            throw new Error(`Authorization failed: ${error.message}`);
        }
    }

    async refreshToken(id) {
        try {
            const user = await UserModel.findById(id);
            if (!user || !user.token || !user.token.refresh_token) {
                throw new Error('No refresh token found');
            }
            const tokenInfo = await this.oAuth2Client.refreshToken(user.token.refresh_token);
            const expiry_date = new Date().getTime() + (tokenInfo.expiry_date * 1000);
            const newToken = {
                access_token: tokenInfo.access_token,
                refresh_token: user.token.refresh_token,
                expiry_date: expiry_date,
            };
            await UserModel.findByIdAndUpdate(id, { token: newToken });
            this.oAuth2Client.setCredentials(newToken);
            return oAuth2Client;
        } catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    async addEvent(event) {
        try {
            const auth = await this.refreshToken()
            const calendar = google.calendar({ version: 'v3', auth });

             event = {
                summary: 'Test Event',
                location: 'Google Office',
                description: 'A test event created using Google Calendar API',
                start: {
                    dateTime: '2024-05-05T09:00:00',
                    timeZone: 'America/Los_Angeles',
                },
                end: {
                    dateTime: '2024-05-05T17:00:00',
                    timeZone: 'America/Los_Angeles',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 10 },
                    ],
                },
            };

            const res = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            return res.data.htmlLink;
        } catch (error) {
            throw new Error(`Error adding event: ${error.message}`);
        }
    }
}

module.exports = new GoogleController();

