/**
 * ML API Integration Layer
 * Communicates with HAPI Multi-Model API (FastAPI)
 * Base URL: https://apimodel-production-481e.up.railway.app
 * 
 * Available models:
 * - MBI: Predicts burnout risk level from 15 MBI-SS items
 * - Emotion: Analyzes emotion from Indonesian text (curhat)
 * - Burnout: Predicts burnout score from 12 numerical features
 * - Lifestyle: Predicts stress level from 7 lifestyle features
 */

const ML_API_BASE = process.env.ML_API_URL || 'https://apimodel-production-481e.up.railway.app';
const ML_API_TIMEOUT = 15000; // 15 seconds

/**
 * Generic ML API caller with error handling
 */
async function callMLApi(endpoint, payload) {
  const url = `${ML_API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ML_API_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ML API error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.error(`[ML-API] Timeout calling ${endpoint}`);
      throw new Error('ML API timeout');
    }
    console.error(`[ML-API] Error calling ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Predict MBI burnout risk level
 * @param {number[]} items - Array of 15 integers (0-6), MBI-SS responses
 * @returns {{ risk_level: string, confidence: number }}
 * Example: { risk_level: "Medium", confidence: 0.9999 }
 */
async function predictMBI(items) {
  if (!Array.isArray(items) || items.length !== 15) {
    throw new Error('MBI requires exactly 15 items');
  }
  return callMLApi('/api/predict/mbi', { items });
}

/**
 * Predict emotion from Indonesian text
 * @param {string} text - Curhat/vent text in Indonesian
 * @returns {{ emotion: string, confidence: number }} (expected format)
 */
async function predictEmotion(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Emotion prediction requires non-empty text');
  }
  return callMLApi('/api/predict/emotion', { teks_curhat: text });
}

/**
 * Predict burnout score from 12 numerical features
 * @param {number[]} features - Array of 12 numbers
 * @returns {{ burnout_score: number }}
 * Example: { burnout_score: 1.9042 }
 */
async function predictBurnout(features) {
  if (!Array.isArray(features) || features.length !== 12) {
    throw new Error('Burnout prediction requires exactly 12 features');
  }
  return callMLApi('/api/predict/burnout', { features });
}

/**
 * Predict lifestyle stress level from 7 features
 * @param {number[]} features - Array of 7 numbers
 * @returns {{ stress_level: string, confidence: number }}
 * Example: { stress_level: "High", confidence: 1.0 }
 */
async function predictLifestyle(features) {
  if (!Array.isArray(features) || features.length !== 7) {
    throw new Error('Lifestyle prediction requires exactly 7 features');
  }
  return callMLApi('/api/predict/lifestyle', { features });
}

/**
 * Check if ML API is available
 * @returns {boolean}
 */
async function checkMLApiHealth() {
  try {
    const response = await fetch(ML_API_BASE, { method: 'GET' });
    const data = await response.json();
    return data.status === 'Active';
  } catch {
    return false;
  }
}

module.exports = {
  predictMBI,
  predictEmotion,
  predictBurnout,
  predictLifestyle,
  checkMLApiHealth,
  ML_API_BASE,
};
