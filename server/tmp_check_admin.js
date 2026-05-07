const db = require('./config/db');
(async () => {
  try {
    const [rows] = await db.execute('SELECT id, email, role, is_approved, is_active FROM users WHERE role = ? LIMIT 10', ['admin']);
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
