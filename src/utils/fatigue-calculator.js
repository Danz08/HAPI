/**
 * Fatigue Risk Score Calculator
 * Based on Maslach Burnout Inventory (MBI) principles
 * Calculates fatigue level from quiz answers, mood, and activity data
 */

// Quiz question weights (based on MBI dimensions)
const DIMENSION_WEIGHTS = {
  emotional_exhaustion: 0.40,  // Kelelahan emosional
  depersonalization: 0.25,     // Depersonalisasi
  personal_accomplishment: 0.20, // Pencapaian pribadi (inverse)
  work_pattern: 0.15,          // Pola kerja
};

/**
 * Calculate fatigue score from quiz answers
 * @param {Array<number>} answers - Array of answer scores (1-5 scale)
 * @returns {Object} - { score, riskLevel, dimensions }
 */
function calculateFatigueFromQuiz(answers) {
  if (!answers || answers.length === 0) {
    return { score: 0, riskLevel: 'Low', dimensions: {} };
  }

  // Map answers to dimensions (questions are grouped by dimension)
  const dimensionScores = {
    emotional_exhaustion: [],
    depersonalization: [],
    personal_accomplishment: [],
    work_pattern: [],
  };

  // Questions 1-3: Emotional Exhaustion
  // Questions 4-5: Depersonalization
  // Questions 6-7: Personal Accomplishment (inversed)
  // Questions 8-10: Work Pattern
  const mapping = [
    'emotional_exhaustion', 'emotional_exhaustion', 'emotional_exhaustion',
    'depersonalization', 'depersonalization',
    'personal_accomplishment', 'personal_accomplishment',
    'work_pattern', 'work_pattern', 'work_pattern',
  ];

  answers.forEach((score, idx) => {
    const dimension = mapping[idx] || 'work_pattern';
    // Invert personal accomplishment (high score = low fatigue)
    if (dimension === 'personal_accomplishment') {
      dimensionScores[dimension].push(6 - score);
    } else {
      dimensionScores[dimension].push(score);
    }
  });

  // Calculate average per dimension
  const dimensions = {};
  let weightedTotal = 0;

  for (const [dim, scores] of Object.entries(dimensionScores)) {
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      dimensions[dim] = Math.round(avg * 20); // Convert 1-5 to 0-100
      weightedTotal += dimensions[dim] * DIMENSION_WEIGHTS[dim];
    } else {
      dimensions[dim] = 0;
    }
  }

  const score = Math.round(weightedTotal);
  const riskLevel = getRiskLevel(score);

  return { score, riskLevel, dimensions };
}

/**
 * Calculate fatigue score including activity and mood data
 * @param {Object} data - { quizScore, avgMood, workHours, breakRatio }
 * @returns {Object}
 */
function calculateComprehensiveFatigue(data) {
  const { quizScore = 50, avgMood = 3, workHoursToday = 0, breakMinutes = 0 } = data;

  // Mood factor (1-5 → weight: low mood increases fatigue)
  const moodFactor = ((6 - avgMood) / 5) * 100;

  // Work hours factor (more hours = more fatigue, exponential after 8h)
  let workFactor = 0;
  if (workHoursToday <= 4) {
    workFactor = workHoursToday * 5;
  } else if (workHoursToday <= 8) {
    workFactor = 20 + (workHoursToday - 4) * 10;
  } else {
    workFactor = 60 + (workHoursToday - 8) * 15;
  }
  workFactor = Math.min(workFactor, 100);

  // Break ratio factor (less breaks = more fatigue)
  const totalWorkMinutes = workHoursToday * 60;
  let breakFactor = 100;
  if (totalWorkMinutes > 0) {
    const idealBreak = totalWorkMinutes * 0.2; // 20% should be break
    breakFactor = Math.max(0, 100 - (breakMinutes / idealBreak) * 100);
  }

  // Weighted combination
  const compositeScore = Math.round(
    quizScore * 0.40 +
    moodFactor * 0.25 +
    workFactor * 0.20 +
    breakFactor * 0.15
  );

  const finalScore = Math.min(100, Math.max(0, compositeScore));

  return {
    score: finalScore,
    riskLevel: getRiskLevel(finalScore),
    breakdown: {
      quiz: Math.round(quizScore),
      mood: Math.round(moodFactor),
      workload: Math.round(workFactor),
      breaks: Math.round(breakFactor),
    },
  };
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score) {
  if (score <= 35) return 'Low';
  if (score <= 65) return 'Medium';
  return 'High';
}

/**
 * Get risk level color
 */
function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'Low': return { bg: '#22c55e', text: '#4ade80', label: 'Rendah' };
    case 'Medium': return { bg: '#f59e0b', text: '#fbbf24', label: 'Sedang' };
    case 'High': return { bg: '#ef4444', text: '#f87171', label: 'Tinggi' };
    default: return { bg: '#64748b', text: '#94a3b8', label: 'N/A' };
  }
}

module.exports = {
  calculateFatigueFromQuiz,
  calculateComprehensiveFatigue,
  getRiskLevel,
  getRiskColor,
  DIMENSION_WEIGHTS,
};
