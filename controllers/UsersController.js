import { v4 as uuidv4 } from 'uuid'; // For generating a unique ID
import { createHash } from 'crypto'; // For SHA1 hashing
import dbClient from '../utils/db.js';

class Userscontroller {
    static async postNew(req, res) {
	const {email, password} = req.body;
	if(!email) {
	    return res.status(400).json({error: 'Missing Email'});
	};
	if(!password) {
	    return res.status(400).json({error: 'Missing password'});
	}
	try {
	    const userscollections = dbClient.database.collection('users');
	    const usrexist = await userscollections.findone({email});
	    if(usrexist) {
		return res.status(400).json({error: 'Already exists'});
	    }
	    // Hash the password using SHA1
      	    const hashed_Password = createHash('sha1').update(password).digest('hex');

      	    // Create the new user object
	    const new_user = {
		email,
		password: hashed_Password
	    }
	    // Insert the new user into the database
	    const result = await userscollection.insertOne(newUser);
	    return res.status(201).json({
		id: result.insertedId,
		email,
	    });
	} catch (err) {
	    console.error('error creating user:, ${error message}');
	    return res.status(500).json({error: 'Internal server error'});
	}
    }
}

module.exports = Userscontroller;

