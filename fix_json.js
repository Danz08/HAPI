const fs = require('fs');
const path = require('path');

// We know what the translations should be based on the keys we added.
const enPath = path.join(__dirname, 'locales', 'en');
const idPath = path.join(__dirname, 'locales', 'id');

function updateJson(filePath, updater) {
    if (!fs.existsSync(filePath)) return;
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    updater(data);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 1. Fix analytics.json "work" and "break"
updateJson(path.join(enPath, 'analytics.json'), data => {
    if (data.detail) {
        data.detail.work = 'Work';
        data.detail.break = 'Break';
        data.detail.quiz = 'Quiz';
        data.detail.mood = 'Mood';
    }
});

updateJson(path.join(idPath, 'analytics.json'), data => {
    if (data.detail) {
        data.detail.work = 'Beban Kerja';
        data.detail.break = 'Istirahat';
        data.detail.quiz = 'Quiz';
        data.detail.mood = 'Mood';
    }
});

// 2. Fix dashboard.json
updateJson(path.join(enPath, 'dashboard.json'), data => {
    // any __NOT_TRANSLATED__ to actual english
    for (const key in data) {
        if (data[key] === '__NOT_TRANSLATED__') {
            if (key === 'activityDesc') data[key] = 'Activity description...';
            else if (key === 'quizzesTaken') data[key] = 'Quizzes Taken';
            else if (key === 'insights') data[key] = 'Insights';
            else if (key === 'noMoodYet') data[key] = 'No mood logged yet.';
            else if (key === 'startWriting') data[key] = 'Start logging →';
            else if (key === 'fatigueBreakdown') data[key] = 'Fatigue Breakdown';
        }
        if (typeof data[key] === 'object') {
            for (const sub in data[key]) {
                if (data[key][sub] === '__NOT_TRANSLATED__') {
                    if (sub === 'quizTitle') data[key][sub] = 'Don\'t forget to take the Quiz today!';
                    if (sub === 'quizText') data[key][sub] = 'Take the quiz now to check your fatigue level and keep your streak going!';
                    if (sub === 'quizConfirm') data[key][sub] = 'Start Quiz';
                    if (sub === 'later') data[key][sub] = 'Maybe Later';
                    if (sub === 'moodTitle') data[key][sub] = 'How are you feeling today?';
                    if (sub === 'moodText') data[key][sub] = 'You haven\'t logged your mood today. Log it now to keep your streak!';
                    if (sub === 'moodConfirm') data[key][sub] = 'Log Mood Now';
                }
            }
        }
    }
});

// 3. Fix nav (general.json or nav.json?)
updateJson(path.join(enPath, 'nav.json'), data => {
    if (data.analytics === '__NOT_TRANSLATED__' || !data.analytics) data.analytics = 'Analytics';
    if (data.dashboard === '__NOT_TRANSLATED__' || !data.dashboard) data.dashboard = 'Dashboard';
    if (data.quiz === '__NOT_TRANSLATED__' || !data.quiz) data.quiz = 'Quiz';
    if (data.pomodoro === '__NOT_TRANSLATED__' || !data.pomodoro) data.pomodoro = 'Pomodoro';
});

// 4. Fix quiz.json
updateJson(path.join(enPath, 'quiz.json'), data => {
    for (const key in data) {
        if (data[key] === '__NOT_TRANSLATED__') {
            if (key === 'exhaustion') data[key] = 'Exhaustion';
            if (key === 'cynicism') data[key] = 'Cynicism';
            if (key === 'efficacy') data[key] = 'Academic Efficacy';
            
            if (key === 'exhaustionLow') data[key] = 'Your exhaustion level is low. You still have good energy.';
            if (key === 'exhaustionMed') data[key] = 'You show moderate signs of exhaustion. Pay attention to rest patterns.';
            if (key === 'exhaustionHigh') data[key] = 'Your exhaustion is high. Prioritize rest and recovery immediately.';
            
            if (key === 'cynicismLow') data[key] = 'You maintain positive attitudes toward your studies.';
            if (key === 'cynicismMed') data[key] = 'You show some cynical attitudes. Try to reconnect with your study goals.';
            if (key === 'cynicismHigh') data[key] = 'High cynicism detected. Consider talking to a counselor or mentor.';
            
            if (key === 'efficacyHigh') data[key] = 'You feel confident in your academic abilities. Great!';
            if (key === 'efficacyMed') data[key] = 'Your academic confidence needs some boost. Celebrate small wins!';
            if (key === 'efficacyLow') data[key] = 'Your academic self-efficacy is low. Seek support and set smaller goals.';
            
            if (key === 'lowRisk') data[key] = 'Low Risk';
            if (key === 'medRisk') data[key] = 'Medium Risk';
            if (key === 'highRisk') data[key] = 'High Risk';
            
            if (key === 'descLow') data[key] = 'Your academic burnout level is low. Keep up your study rhythm and maintain balance!';
            if (key === 'descMedium') data[key] = 'You show moderate signs of academic burnout. Start paying attention to rest patterns and activity balance.';
            if (key === 'descHigh') data[key] = 'Your academic burnout level is high. Take immediate steps to rest, reduce workload, and consider speaking with a counselor.';
            
            if (key === 'riskLow') data[key] = 'Low';
            if (key === 'riskMed') data[key] = 'Medium';
            if (key === 'riskHigh') data[key] = 'High';
        }
        if (key === 'swal') {
            for (const sub in data[key]) {
                if (data[key][sub] === '__NOT_TRANSLATED__') {
                    if (sub === 'streakDays') data[key][sub] = 'Days Streak!';
                    if (sub === 'streakDesc') data[key][sub] = 'Awesome! Your consistency in taking quizzes is great. Keep it up!';
                }
            }
        }
    }
});

// 5. Fix pomodoro (pomo.json)
updateJson(path.join(enPath, 'pomo.json'), data => {
    for (const key in data) {
        if (data[key] === '__NOT_TRANSLATED__') {
            if (key === 'now') data[key] = 'Now';
            if (key === 'setTimer') data[key] = 'Set timer';
            if (key === 'meetingLabel') data[key] = 'Meeting';
            if (key === 'timerStarted') data[key] = 'Timer started';
            if (key === 'noSchedule') data[key] = 'No schedule remaining today.';
            if (key === 'loadFail') data[key] = 'Failed to load calendar';
        }
    }
});

// 6. Fix mood.json
updateJson(path.join(enPath, 'mood.json'), data => {
    for (const key in data) {
        if (data[key] === '__NOT_TRANSLATED__') {
            if (key === 'score1') data[key] = 'Very Bad';
            if (key === 'score2') data[key] = 'Bad';
            if (key === 'score3') data[key] = 'Okay';
            if (key === 'score4') data[key] = 'Good';
            if (key === 'score5') data[key] = 'Very Good';
            if (key === 'notesPlaceholder') data[key] = 'Anything you want to share? (optional)';
        }
    }
});

console.log("JSON fixed.");
