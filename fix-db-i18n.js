const { pool } = require('./src/config/database');

const titleMap = {
  '✨ Pertahankan Ritme Kerjamu!': '✨ Keep Up Your Rhythm!',
  '🎯 Tetap Produktif': '🎯 Stay Productive',
  '💪 Challenge Yourself': '💪 Challenge Yourself',
  '⚠️ Waspada Kelelahan': '⚠️ Watch for Fatigue',
  '🧘 Istirahat Berkualitas': '🧘 Quality Rest',
  '📋 Prioritaskan Tugasmu': '📋 Prioritize Your Tasks',
  '🚨 Tingkat Fatigue Tinggi': '🚨 High Fatigue Level',
  '💤 Prioritaskan Tidur': '💤 Prioritize Sleep',
  '🗣️ Jangan Ragu Bercerita': '🗣️ Don\'t Hesitate to Talk'
};

async function fixDB() {
  try {
    const res = await pool.query('SELECT id, recommendations FROM quiz_results');
    
    for (const row of res.rows) {
      if (!row.recommendations) continue;
      
      try {
        const recs = JSON.parse(row.recommendations);
        let updated = false;
        
        if (recs && recs.insights) {
          recs.insights.forEach(ins => {
            if (!ins.title_en && titleMap[ins.title]) {
              ins.title_en = titleMap[ins.title];
              updated = true;
            }
          });
        }
        
        if (updated) {
          await pool.query('UPDATE quiz_results SET recommendations = $1 WHERE id = $2', [JSON.stringify(recs), row.id]);
        }
      } catch (e) {
        console.error('Failed to parse json for id', row.id, e);
      }
    }
    console.log('Fixed DB translations.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixDB();
