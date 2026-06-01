require('dotenv').config();
const { pool } = require('./src/config/database');

async function check() {
  try {
    const res = await pool.query('SELECT recommendations FROM quiz_results');
    const titles = new Set();
    const missing = new Set();
    res.rows.forEach(r => {
      if (r.recommendations && r.recommendations.insights) {
        r.recommendations.insights.forEach(ins => {
          titles.add(ins.title);
          if (!ins.title_en) {
            missing.add(ins.title);
          }
        });
      }
    });
    console.log("All unique titles in DB:");
    console.log(Array.from(titles));
    console.log("\nTitles missing title_en:");
    console.log(Array.from(missing));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

check();
