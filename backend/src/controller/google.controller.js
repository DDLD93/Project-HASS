const { google } = require('googleapis');
const UserCtrl = require('../controller/auth.controller');
const { googleClientId, googleSecret, googleRedirectUri } = require("../config");

class GoogleController {
    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            googleClientId,
            googleSecret,
            googleRedirectUri
        );
    }

    async authorizeCalendar(id, code) {
        try {
            const { tokens } = await this.oAuth2Client.getToken(code);
            const expiryDate = new Date().getTime() + (tokens.expiry_date * 1000);
            const newToken = {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: expiryDate,
            };
            const { ok, data: user, message } = await UserCtrl.updateUser(id, { token: newToken });
            if (!ok) throw new Error(message);
            this.oAuth2Client.setCredentials(newToken);
            const token = this.generateToken(user);
            return { ok: true, data: { user, token }, message: "Login successful" };
        } catch (error) {
            console.error("Error authorizing calendar:", error);
            return { ok: false, message: error.message };
        }
    }

    async refreshToken(id) {
        try {
            const { data: user } = await UserCtrl.getUser(id);
            if (!user.token.refresh_token) throw new Error(message);
            const tokenInfo = await this.oAuth2Client.refreshToken(user.token.refresh_token);
            const expiryDate = new Date().getTime() + (tokenInfo.expiry_date * 1000);
            const newToken = {
                access_token: tokenInfo.access_token,
                refresh_token: user.token.refresh_token,
                expiry_date: expiryDate,
            };
            const { ok, message } = await UserCtrl.updateUser(id, { token: newToken });
            if (!ok) throw new Error(message);
            this.oAuth2Client.setCredentials(newToken);
            return this.oAuth2Client;
        } catch (error) {
            console.error("Error refreshing token:", error);
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    async addEvent(userId, event) {
        try {
            const auth = await this.refreshToken(userId);
            const calendar = google.calendar({ version: 'v3', auth });
            const res = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            return res.data.htmlLink;
        } catch (error) {
            console.error("Error adding event:", error);
            throw new Error(`Error adding event: ${error.message}`);
        }
    }

    generateToken(user) {
        return UserCtrl.encodeToken({
            email: user.email,
            role: user.role,
            id: user._id,
        }, { expiresIn: "5h" });
    }
}

module.exports = new GoogleController();
