import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AppController {
  // GET /status
  static async getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    return res.status(200).json({
      redis: redisAlive,
      db: dbAlive,
    });
  }

  // GET /stats
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    return res.status(200).json({
      users: usersCount,
      files: filesCount,
    });
  }
}

export default AppController;
