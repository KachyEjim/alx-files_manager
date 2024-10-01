import sha1 from 'sha1';
import { ObjectID } from 'mongodb'; // Make sure to import ObjectID
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * Handles the creation of a new user by processing
 * the provided email and password from the request body.
 * Checks for missing email or password and returns corresponding error responses.
 * Verifies if the user already exists in the database and hashes
 * the password using the 'sha1' algorithm.
 * Inserts the new user into the 'users' collection and returns the user's
 * ID and email upon successful creation.
 * Logs any errors that occur during the process and sends an 'Internal Server
 * Error' response if needed.
 * @param {Object} req - The request object containing the user's email and password.
 * @param {Object} res - The response object used to send responses back to the client.
 * @returns {Object} The ID and email of the newly created user or an error response.
 */

class Userscontroller {
  /**
   * Handles the creation of a new user by processing
   * the provided email and password from the request body.
   * Checks for missing email or password and returns corresponding error responses.
   * Verifies if the user already exists in the database and hashes
   * the password using the 'sha1' algorithm.
   * Inserts the new user into the 'users' collection and returns the user's
   * ID and email upon successful creation.
   * Logs any errors that occur during the process and sends an 'Internal Server
   * Error' response if needed.
   * @param {Object} req - The request object containing the user's email and password.
   * @param {Object} res - The response object used to send responses back to the client.
   * @returns {Object} The ID and email of the newly created user or an error response.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing Email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    let result;
    try {
      const usrexist = await dbClient.usersCollection.findOne({ email });
      if (usrexist) {
        return res.status(400).json({ error: 'Already exists' });
      }
      const hashedPassword = sha1(password);

      result = await dbClient.usersCollection.insertOne({ email, password: hashedPassword });
    } catch (err) {
      console.error(`error creating user:, ${err}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(201).json({
      id: result.insertedId,
      email,
    });
  }

  /**
 * Retrieves the user information based on the provided token in the request headers.
 * Verifies the token's validity and fetches the corresponding user details from the database.
 * If the token is missing or invalid, returns an 'Unauthorized' error response.
 * If an error occurs during the retrieval process, logs the error and returns
 * an 'Internal Server Error' response.
 * @param {Object} req - The request object containing the token in the headers.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Object} The user information (id and email) if the retrieval is
 * successful, or an error response.
 */
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const user = await dbClient.usersCollection.findOne({ _id: new ObjectID(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({
        id: user._id,
        email: user.email,
      });
    } catch (err) {
      console.error(`Error retrieving user: ${err.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default Userscontroller;
