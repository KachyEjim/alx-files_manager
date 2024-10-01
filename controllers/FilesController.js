import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import path from 'path';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  /**
 * Handles the file upload process after validating the user's token and request body.
 * Saves folders directly to the database and files/images locally.
 * Validates the request body, checks parent ID if provided, and ensures folder existence.
 * Generates a unique filename for files/images and saves them to the local path.
 * Creates a new file document in MongoDB and returns the result.
 *
 * @param {Object} req - The request object containing the user's token and file details.
 * @param {Object} res - The response object to send back success or error messages.
 * @returns {Object} - Returns a JSON response with the inserted file details or error messages.
 */
  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    // Check for token in the header
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the token exists in Redis
    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validate request body
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check parentId if provided
    if (parentId !== 0) {
      const parentFile = await dbClient.filesCollection.findOne({ _id: parentId });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // If type is folder, save directly in the DB
    if (type === 'folder') {
      const newFolder = {
        userId,
        name,
        type,
        isPublic,
        parentId,
      };

      const result = await dbClient.filesCollection.insertOne(newFolder);
      return res.status(201).json({
        id: result.insertedId,
        ...newFolder,
      });
    }

    // For files or images, save them locally
    const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

    // Ensure folder exists
    await fsPromises.mkdir(FOLDER_PATH, { recursive: true });

    // Generate a unique filename and save file to the local path
    const fileUuid = uuidv4();
    const filePath = path.join(FOLDER_PATH, fileUuid);
    const fileData = Buffer.from(data, 'base64');

    try {
      await fsPromises.writeFile(filePath, fileData);
    } catch (error) {
      console.error(`Error saving file: ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Create a new file document in MongoDB
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath: filePath,
    };

    const result = await dbClient.filesCollection.insertOne(newFile);
    return res.status(201).json({ id: result.insertedId, ...newFile });
  }

  /**
 * Retrieves a specific file based on the provided ID after validating the user's token.
 *
 * @param {Object} req - The request object containing the user's token in the headers and
 * the file ID in the parameters.
 * @param {Object} res - The response object to send back the retrieved file or error messages.
 * @returns {Object} - Returns a JSON response with the file if found, or an error message if
 * not found or unauthorized.
 */
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const { id } = req.params;

    // check for token in the header
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // check if token exists in Redis
    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Retrieve file by ID
    const file = await dbClient.filesCollection.findOne({ _id: id, userId });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  /**
 * Retrieves files for a user based on the provided parent ID with pagination.
 *
 * @param {Object} req - The request object containing headers and query parameters.
 * @param {Object} res - The response object to send back the files.
 * @returns {Object} - Returns a JSON response with the files found based on the parent
 * ID and pagination.
 */
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const { parentId = 0, page = 0 } = req.query;

    // Check for token in the header
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if the token exists in Redis
    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pageSize = 20;
    const skip = parseInt(page, 10) * pageSize;

    // Find files for the user, based on parentId with pagination
    const files = await dbClient.filesCollection
      .find({ userId, parentId })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(files);
  }
}

export default FilesController;
