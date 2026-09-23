import app from './app.js';
import { initDb } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Campus Lost & Found Server running on port ${PORT}`);
      console.log(` API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

startServer();
