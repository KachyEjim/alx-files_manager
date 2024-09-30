import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';


class AuthController {
    static async getConnect(req, res) {
	const auth_Headers = res.headers.authorization;
	// Check for the Authorization header
	if (!auth_Header || !auth_Header.startsWith('Basic ')) {
	    return res.status(401).json({ error: 'Unauthorized' });
	}

	// Decode Base64 email:password
	const base64_crd = auth_Header.split(' ')[1];
	const user_tok = Buffer.from(base64_crd, 'base64').toString('ascii');
	const [email, password] = user_tok.split(':');
	const hashed_pwd = createHash('sha1').update(password).digest('hex');
	try {
      	    // Look for the user in MongoDB
      	    const usersCollection = dbClient.database.collection('users');
	    const user = await usersCollection.findOne({ email, password: hashe_pwd });
	    
	    // check if there is a user
	    if(!user) {
	        res.status(401).json({ error: 'Unauthorized'});
	    }
	
	    // Generate a new token
      	    const token = uuidv4();
      	    const tokenKey = 'auth_${token}';
	    
	    // Store user ID in Redis for 24 hours
      	    await redisClient.set(tokenKey, user._id.toString(), 86400);
	    // Return the token
      	    return res.status(200).json({ token });
	} catch (err) {
	    console.error('Authentication Error: ${err.message}');
	    res.status(500).json({ error: 'Internal Server Error' });
	}
    }

    static async getDisconnect(req, res) {
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

    // Delete the token from Redis
    await redisClient.del(tokenKey);

    // Return a 204 status (No Content)
    return res.status(204).send();
  }
}

export default AuthController;
