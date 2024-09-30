import { MongoClient } from 'mongodb'

class DBClient {
	constructor() {
		const host = process.env.DB_HOST || 'localhost';
		const port = process.env.DB_PORT || 'port';
		const database = process.env.DB_DATABASE || 'files_manager';
		const url = `mongodb://${host}:${port}`;
		this.client = new MongoClient(url, { useUnifiedTopology: true });
		this.client.connect()
			.then(() => {
				this.database = this.client.db(database);
				console.log('Successfully connected to MongoDB server');
			})
			.catch((err) => {
				console.log('Failed to connect to MongoDB server', err);
			});
	};

	/**
	 * Check if the database client is connected and alive.
	 * @returns {boolean} True if the client is connected and alive, false otherwise.
	 */
	isAlive() {
		return this.client && this.client.isConnected();
	}

	/**
	 * Asynchronously retrieves the total number of users from the 'users' collection in the database.
	 * @returns {Promise<number>} A promise that resolves to the total number of users in the collection.
	 */  /**
* Returns the number of documents in the 'users' collection
* @return {Promise<number>} the number of documents in the users collection
*/
	async nbUsers() {
		return this.database.collection('users').countDocuments();
	}

	/**
	 * Returns the number of documents in the 'files' collection
	 * @return {Promise<number>} the number of documents in the files collection
	 */
	async nbFiles() {
		return this.database.collection('files').countDocuments();
	}
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
