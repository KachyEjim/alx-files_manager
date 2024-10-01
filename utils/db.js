import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;
/**
 * Check if the database client is connected and alive.
 * @returns {boolean} True if the client is connected and alive, false otherwise.
 *
 * Returns the number of documents in the 'users' collection
 * @return {Promise<number>} the number of documents in the users collection
 *
 * Returns the number of documents in the 'files' collection
 * @return {Promise<number>} the number of documents in the files collection
 */

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        // console.log('Connected successfully to server');
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
  }

  /**
   * Check if the database client is connected and alive.
   * @returns {boolean} True if the client is connected and
   * alive, false otherwise.
   */
  isAlive() {
    return Boolean(this.db);
  }

  /**
    * Asynchronously retrieves the total number of users from the
    * 'users' collection in the database.
    * @returns {Promise<number>} A promise that resolves to the total
    * number of users in the collection.
    */

  async nbUsers() {
    const numberOfUsers = this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  /**
   * Returns the number of documents in the 'files' collection
   * @return {Promise<number>} the number of documents in the files collection
   */
  async nbFiles() {
    const numberOfFiles = this.filesCollection.countDocuments();
    return numberOfFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;
