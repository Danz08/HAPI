
function extractCalendarFeatures(events) {
  if (!events || events.length === 0) {
    return {
      meetings_count: 0,
      work_hours: 0,
      back_to_back_count: 0,
      longest_block_minutes: 0,
      avg_gap_minutes: 0,
      earliest_start: null,
      latest_end: null,
    };
  }

  const count = events.length;
  let workHours = 0;
  let backToBack = 0;
  let longestBlockMinutes = 0;
  const gaps = [];

  // Calculate work span
  const firstStart = new Date(events[0].start.dateTime || events[0].start.date);
  const lastEnd = new Date(events[count - 1].end.dateTime || events[count - 1].end.date);
  workHours = (lastEnd - firstStart) / 36e5; // ms to hours

  // Calculate per-event duration and back-to-back
  for (let i = 0; i < count; i++) {
    const evStart = new Date(events[i].start.dateTime || events[i].start.date);
    const evEnd = new Date(events[i].end.dateTime || events[i].end.date);
    const durationMin = (evEnd - evStart) / 60000;

    if (durationMin > longestBlockMinutes) {
      longestBlockMinutes = durationMin;
    }

    if (i < count - 1) {
      const nextStart = new Date(events[i + 1].start.dateTime || events[i + 1].start.date);
      const gapMs = nextStart - evEnd;
      const gapMin = gapMs / 60000;
      gaps.push(gapMin);

      // Back-to-back: gap <= 15 minutes
      if (gapMin <= 15) backToBack++;
    }
  }

  const avgGap = gaps.length > 0
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    : 0;

  return {
    meetings_count: count,
    work_hours: Math.round(workHours * 100) / 100,
    back_to_back_count: backToBack,
    longest_block_minutes: Math.round(longestBlockMinutes),
    avg_gap_minutes: avgGap,
    earliest_start: firstStart.toISOString(),
    latest_end: lastEnd.toISOString(),
  };
}

function calculateCalendarBurnoutScore(features) {
  if (!features || features.meetings_count === 0) {
    return { score: 0, factors: {} };
  }

  // Meeting overload factor (0-100)
  // 0-3 meetings = low, 4-6 = medium, 7+ = high
  let meetingFactor = 0;
  if (features.meetings_count <= 3) {
    meetingFactor = features.meetings_count * 8;
  } else if (features.meetings_count <= 6) {
    meetingFactor = 24 + (features.meetings_count - 3) * 15;
  } else {
    meetingFactor = 69 + (features.meetings_count - 6) * 10;
  }
  meetingFactor = Math.min(meetingFactor, 100);

  // Work span factor (0-100)
  // 0-6h = low, 6-9h = medium, 9+ = high
  let workSpanFactor = 0;
  if (features.work_hours <= 6) {
    workSpanFactor = features.work_hours * 7;
  } else if (features.work_hours <= 9) {
    workSpanFactor = 42 + (features.work_hours - 6) * 13;
  } else {
    workSpanFactor = 81 + (features.work_hours - 9) * 10;
  }
  workSpanFactor = Math.min(workSpanFactor, 100);

  // Back-to-back factor (0-100)
  // High penalty for consecutive meetings with no breaks
  let b2bFactor = 0;
  if (features.meetings_count > 1) {
    const b2bRatio = features.back_to_back_count / (features.meetings_count - 1);
    b2bFactor = Math.round(b2bRatio * 100);
  }

  // Low gap factor (0-100)
  // Average gap < 15min = high risk, > 60min = low risk
  let gapFactor = 0;
  if (features.avg_gap_minutes <= 15) {
    gapFactor = 80;
  } else if (features.avg_gap_minutes <= 30) {
    gapFactor = 50;
  } else if (features.avg_gap_minutes <= 60) {
    gapFactor = 20;
  }

  // Weighted combination
  const score = Math.round(
    meetingFactor * 0.30 +
    workSpanFactor * 0.30 +
    b2bFactor * 0.25 +
    gapFactor * 0.15
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    factors: {
      meetings: Math.round(meetingFactor),
      workSpan: Math.round(workSpanFactor),
      backToBack: Math.round(b2bFactor),
      gaps: Math.round(gapFactor),
    },
  };
}

module.exports = {
  extractCalendarFeatures,
  calculateCalendarBurnoutScore,
};
