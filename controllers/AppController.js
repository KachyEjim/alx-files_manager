import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Class representing the application controller.
 * @class
 */
class AppController {
  // GET /status
  /**
 * Retrieves the status of the Redis and database clients.
 *
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
  static getStatus(request, response) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    response.status(200).send(status);
  }

  // GET /stats
  /**
   * Retrieves the statistics of the number of users
   * and files from the database.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} The number of users and files in the database.
   */
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    return res.status(200).send({
      users: usersCount,
      files: filesCount,
    });
  }
}

export default AppController;
