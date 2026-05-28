
// MBI-SS Dimension Weights (Academic Burnout)
const DIMENSION_WEIGHTS = {
  emotional_exhaustion: 0.40,    // Exhaustion (5 items)
  depersonalization: 0.30,       // Cynicism (4 items)
  personal_accomplishment: 0.30, // Academic Efficacy (6 items, inverse)
};

// MBI-SS question mapping (15 questions, 0-6 scale)
const QUESTION_MAPPING = [
  // Exhaustion: Q1-Q5
  'emotional_exhaustion', 'emotional_exhaustion', 'emotional_exhaustion',
  'emotional_exhaustion', 'emotional_exhaustion',
  // Cynicism: Q6-Q9
  'depersonalization', 'depersonalization', 'depersonalization', 'depersonalization',
  // Academic Efficacy: Q10-Q15 (inverse scored)
  'personal_accomplishment', 'personal_accomplishment', 'personal_accomplishment',
  'personal_accomplishment', 'personal_accomplishment', 'personal_accomplishment',
];

function calculateFatigueFromQuiz(answers) {
  if (!answers || answers.length === 0) {
    return { score: 0, riskLevel: 'Low', dimensions: {} };
  }

  // Map answers to dimensions
  const dimensionScores = {
    emotional_exhaustion: [],
    depersonalization: [],
    personal_accomplishment: [],
  };

  answers.forEach((score, idx) => {
    const dimension = QUESTION_MAPPING[idx];
    if (!dimension) return;

    // Invert Academic Efficacy (high score = low burnout)
    if (dimension === 'personal_accomplishment') {
      dimensionScores[dimension].push(6 - score);
    } else {
      dimensionScores[dimension].push(score);
    }
  });

  // Calculate average per dimension and normalize to 0-100
  const dimensions = {};
  let weightedTotal = 0;

  for (const [dim, scores] of Object.entries(dimensionScores)) {
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      // MBI-SS scale 0-6 → normalize to 0-100
      dimensions[dim] = Math.round((avg / 6) * 100);
      weightedTotal += dimensions[dim] * (DIMENSION_WEIGHTS[dim] || 0);
    } else {
      dimensions[dim] = 0;
    }
  }

  const score = Math.round(weightedTotal);
  const riskLevel = getRiskLevel(score);

  // Also provide raw averages per dimension for detailed display
  const dimensionAverages = {};
  for (const [dim, scores] of Object.entries(dimensionScores)) {
    if (scores.length > 0) {
      dimensionAverages[dim] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    } else {
      dimensionAverages[dim] = 0;
    }
  }

  return { score, riskLevel, dimensions, dimensionAverages };
}

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

function getRiskLevel(score) {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
}

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
