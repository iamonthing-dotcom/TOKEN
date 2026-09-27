const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Retrieve LiveKit API credentials from environment variables
const apiKey = process.env.LIVEKIT_API_KEY || 'your_api_key';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'your_api_secret';

/**
 * GET /api/token
 * Query Parameters:
 * - room: 6-character session code (e.g., ABC123)
 * - identity: unique participant identifier
 * - role: "client" (can publish camera/screen) or "admin" (subscribe-only)
 */
app.get('/api/token', async (req, res) => {
    const roomName = req.query.room;
    const identity = req.query.identity || 'user';
    const role = req.query.role || 'client';

    if (!roomName || roomName.length !== 6) {
        return res.status(400).json({ error: 'A valid 6-character room session code is required.' });
    }

    try {
        // Create an AccessToken with a 30-minute TTL (Time-To-Live)
        const at = new AccessToken(apiKey, apiSecret, {
            identity: identity,
            ttl: '30m', 
        });

        // Configure role-based permissions
        const grant = {
            room: roomName,
            roomJoin: true,
            canPublish: role === 'client', // Clients can publish camera/screen; admins cannot publish
            canSubscribe: true,           // Both can subscribe
            canPublishData: true,
        };

        at.addGrant(grant);

        const token = await at.toJwt();
        res.json({ token });
    } catch (error) {
        console.error('Error generating LiveKit token:', error);
        res.status(500).json({ error: 'Failed to generate access token' });
    }
});

app.listen(port, () => {
    console.log(`SecureLink LiveKit Token Server running on port ${port}`);
});