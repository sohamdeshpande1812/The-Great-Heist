import { connectToDatabase } from './db.js';

/**
 * Vercel Serverless Function handler for Game Session Save & Resume API.
 * Uses the 'gameSessions' collection in MongoDB Atlas.
 *
 * Supports:
 * - GET: Retrieves an active game session using 'sessionId' query parameter.
 * - POST: Upserts an active session in the 'gameSessions' collection based on 'sessionId'.
 *
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Set CORS headers for Vercel deployment and client access
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET requests: Fetch game session by sessionId query param
  if (req.method === 'GET') {
    // Extract sessionId from query params or URL query string
    let sessionId = req.query?.sessionId;
    if (!sessionId && req.url) {
      try {
        const parsedUrl = new URL(req.url, 'http://localhost');
        sessionId = parsedUrl.searchParams.get('sessionId') || parsedUrl.searchParams.get('session');
      } catch (e) {
        // Fallback if URL parsing fails
      }
    }

    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Query parameter "sessionId" is required and must be a non-empty string.'
      });
    }

    const cleanSessionId = sessionId.trim();

    try {
      const { db } = await connectToDatabase();
      const gameSessionsCollection = db.collection('gameSessions');

      const session = await gameSessionsCollection.findOne({ sessionId: cleanSessionId });

      if (!session) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Active game session with ID "${cleanSessionId}" was not found.`
        });
      }

      return res.status(200).json({
        success: true,
        session
      });
    } catch (error) {
      console.error('GameSessions API GET error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to retrieve game session.'
      });
    }
  }

  // Handle POST requests: Save or update active game session using upsert
  if (req.method === 'POST') {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch (parseError) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Malformed JSON payload in request body.'
      });
    }

    const {
      sessionId,
      playerName,
      position,
      floor,
      remainingTime,
      loot,
      inventory,
      keycards,
      alarmStatus,
      lastSavedTime,
      difficulty,
      timeElapsed,
      vaultCracked
    } = body;

    // Validate required sessionId
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "sessionId" is required and must be a non-empty string.'
      });
    }

    const cleanSessionId = sessionId.trim();
    const cleanPlayerName = playerName ? String(playerName).trim().slice(0, 30) : 'CYBER_GHOST';

    // Format position { x, y, z }
    const cleanPosition = {
      x: typeof position?.x === 'number' ? Number(position.x.toFixed(3)) : 0,
      y: typeof position?.y === 'number' ? Number(position.y.toFixed(3)) : 0,
      z: typeof position?.z === 'number' ? Number(position.z.toFixed(3)) : 15
    };

    const cleanFloor = floor ? String(floor).trim() : 'GROUND FLOOR (LOBBY)';
    const cleanRemainingTime = typeof remainingTime === 'number' ? Math.max(0, remainingTime) : Math.max(0, Number(remainingTime) || 0);

    // Format loot statistics
    const cleanLoot = {
      carriedValue: Number(loot?.carriedValue) || 0,
      securedValue: Number(loot?.securedValue) || 0,
      totalItemsCollectedCount: Number(loot?.totalItemsCollectedCount) || 0
    };

    // Format inventory items
    const cleanInventory = Array.isArray(inventory)
      ? inventory.map(item => ({
          id: String(item.id || item.typeKey || 'gold').toLowerCase(),
          typeKey: String(item.typeKey || item.id || 'GOLD').toUpperCase(),
          name: String(item.name || 'Valuable Item'),
          value: Number(item.value) || 0,
          weight: Number(item.weight) || 1,
          icon: item.icon ? String(item.icon) : '💰'
        }))
      : [];

    // Format keycards
    const cleanKeycards = Array.isArray(keycards)
      ? keycards.map(k => String(k).toLowerCase())
      : [];

    // Format alarm status
    const cleanAlarmStatus = {
      isAlarmActive: Boolean(alarmStatus?.isAlarmActive),
      alarmTimer: Number(alarmStatus?.alarmTimer) || 0,
      state: alarmStatus?.state ? String(alarmStatus.state) : (alarmStatus?.isAlarmActive ? 'alert' : 'safe')
    };

    const parsedSavedDate = lastSavedTime ? new Date(lastSavedTime) : new Date();
    const validSavedDate = isNaN(parsedSavedDate.getTime()) ? new Date() : parsedSavedDate;

    const sessionDocument = {
      sessionId: cleanSessionId,
      playerName: cleanPlayerName,
      position: cleanPosition,
      floor: cleanFloor,
      remainingTime: cleanRemainingTime,
      loot: cleanLoot,
      inventory: cleanInventory,
      keycards: cleanKeycards,
      alarmStatus: cleanAlarmStatus,
      lastSavedTime: validSavedDate,
      difficulty: difficulty ? String(difficulty) : 'normal',
      timeElapsed: Number(timeElapsed) || 0,
      vaultCracked: Boolean(vaultCracked),
      updatedAt: new Date()
    };

    try {
      const { db } = await connectToDatabase();
      const gameSessionsCollection = db.collection('gameSessions');

      const result = await gameSessionsCollection.updateOne(
        { sessionId: cleanSessionId },
        {
          $set: sessionDocument,
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Game session saved successfully.',
        sessionId: cleanSessionId,
        upserted: Boolean(result.upsertedId),
        session: sessionDocument
      });
    } catch (error) {
      console.error('GameSessions API POST error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to save game session.'
      });
    }
  }

  // Unsupported HTTP Method
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
