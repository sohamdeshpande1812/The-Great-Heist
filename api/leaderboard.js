import { connectToDatabase } from './db.js';

/**
 * Vercel Serverless Function handler for the leaderboard API.
 * 
 * Supports:
 * - GET: Fetches the top 10 scores from the 'leaderboard' collection sorted by score descending.
 * - POST: Saves a new score entry containing playerName, score, lootValue, timeRemaining, extractionRoute, and completedTime.
 * 
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Set CORS headers for cross-origin or preview client access
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

  // Handle GET requests
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const leaderboardCollection = db.collection('leaderboard');

      // Fetch top 10 scores sorted by score descending
      const topScores = await leaderboardCollection
        .find({})
        .sort({ score: -1 })
        .limit(10)
        .toArray();

      return res.status(200).json(topScores);
    } catch (error) {
      console.error('Leaderboard API GET error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to retrieve leaderboard records.'
      });
    }
  }

  // Handle POST requests
  if (req.method === 'POST') {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch (parseError) {
      return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
    }

    const {
      playerName,
      score,
      lootValue,
      timeRemaining,
      extractionRoute,
      completedTime
    } = body;

    // Validate required fields
    if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
      return res.status(400).json({ error: 'Field "playerName" is required and must be a non-empty string.' });
    }

    if (score === undefined || score === null || isNaN(Number(score))) {
      return res.status(400).json({ error: 'Field "score" is required and must be a valid number.' });
    }

    const parsedDate = completedTime ? new Date(completedTime) : new Date();
    const validCompletedTime = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const newEntry = {
      playerName: playerName.trim(),
      score: Number(score),
      lootValue: Number(lootValue) || 0,
      timeRemaining: Number(timeRemaining) || 0,
      extractionRoute: extractionRoute ? String(extractionRoute) : 'Standard Extraction',
      completedTime: validCompletedTime
    };

    try {
      const { db } = await connectToDatabase();
      const leaderboardCollection = db.collection('leaderboard');

      const result = await leaderboardCollection.insertOne(newEntry);

      return res.status(201).json({
        success: true,
        message: 'Score saved successfully.',
        insertedId: result.insertedId,
        entry: newEntry
      });
    } catch (error) {
      console.error('Leaderboard API POST error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to save score.'
      });
    }
  }

  // Unsupported HTTP Method
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
