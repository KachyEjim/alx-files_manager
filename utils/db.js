import dotenv from 'dotenv';
import { mongoClient } from 'mongodb'

class DBClient {
	constructor() {
		const host = process.env.DB_HOST || 'localhost';
		const port = process.env.DB_PORT || 'port';
		const data_base = process.env.DB_DATABASE || 'files_manager';
		const url = `mongodb://${host}:${port}`;

		this.client = new mongoClient(url, { useUnifieldTopology: true });
		this.database = this.client.db(database);
		this.client.connect().catch((err) => {
			console.log('Failed to connect to Mongodb server', err);
		});
	};
	isAlive(){
		return this.client && this.client.isconnected();
	}
    async nbUsers() {
	const users_collection = this.database.collection('users');
	return users_collection.countDocuments();
}
    async nbFiles() {
	const files_collection = this.database.collection('files');
	return files_collection.countDocuments();
}
}
const dbclient = new DBClient();
module.exports = dbclient;
