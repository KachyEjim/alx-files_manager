import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Authenticates a user based on the provided credentials in the request headers.
 * Parses the Basic authentication header, validates the
 * credentials, and generates a token for authorized users.
 * If authentication fails, appropriate error responses are sent.
 * Utilizes database and Redis client for user data retrieval and token management.
 *
 * @param {Object} req - The request object containing the user's credentials in the headers.
 * @param {Object} res - The response object used to send responses back to the client.
 * @returns {Object} - Returns a JSON response with a token if
 * authentication is successful, or error responses if authentication fails.
 */
class AuthController {
  /**
   * Authenticates a user based on the provided credentials in the request headers.
   * Parses the Basic authentication header, validates the
   * credentials, and generates a token for authorized users.
   * If authentication fails, appropriate error responses are sent.
   * Utilizes database and Redis client for user data retrieval and token management.
   *
   * @param {Object} req - The request object containing the user's credentials in the headers.
   * @param {Object} res - The response object used to send responses back to the client.
   * @returns {Object} - Returns a JSON response with a token if
   * authentication is successful, or error responses if authentication fails.
   */
  static async getConnect(req, res) {
    const authHeaders = req.headers.authorization; // Fixed to get from req.headers

    if (!authHeaders || !authHeaders.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Crd = authHeaders.split(' ')[1];
    let userTok;
    try {
      userTok = Buffer.from(base64Crd, 'base64').toString('utf-8');
    } catch (err) {
      return res.status(400).json({ error: 'Invalid credentials format' });
    }

    const [email, password] = userTok.split(':');
    const hashedPwd = createHash('sha1').update(password).digest('hex');

    try {
      const user = await dbClient.usersCollection.findOne({ email });

      if (!user || user.password !== hashedPwd) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const tokenKey = `auth_${token}`;
      await redisClient.set(tokenKey, user._id.toString(), 86400); // Ensure the set is awaited

      return res.status(200).json({ token });
    } catch (err) {
      console.error(`Authentication Error: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
 * Retrieves the user ID associated with the provided token from Redis.
 * If the token is missing or invalid, returns an 'Unauthorized' error response.
 * Deletes the token from Redis upon successful disconnection.
 *
 * @param {Object} req - The request object containing the token in the headers.
 * @param {Object} res - The response object used to send responses back to the client.
 * @returns {Object} - Returns a JSON response with status 204 if disconnection is successful,
 * or error responses with status 401 if the token is missing or invalid.
 */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(tokenKey);
    return res.status(204).send();
  }
}

export default AuthController;
