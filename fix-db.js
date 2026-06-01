const { pool } = require('./src/config/database');

async function fixDB() {
  try {
    const res1 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'âš ï¸', '⚠️')`);
    const res2 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'âœ¨', '✨')`);
    const res3 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'ðŸŽ¯', '🎯')`);
    const res4 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'ðŸ’ª', '💪')`);
    const res5 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'ðŸ§˜', '🧘')`);
    const res6 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'ðŸ“‹', '📋')`);
    const res7 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'ðŸš¨', '🚨')`);
    const res8 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'ðŸ’¤', '💤')`);
    const res9 = await pool.query(`UPDATE quiz_results SET recommendations = REPLACE(recommendations, 'ðŸ—£ï¸', '🗣️')`);
    
    console.log('Fixed recommendations in DB.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixDB();
