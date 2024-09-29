import { createClient } from 'redis'
import { Promisify } from 'utils'

class RedisClient {
    constructor(client) {
	this.client = redis.createClient;
	client.on('error', (err) => {
	    console.log('An error Occured, Redis wom start', err);
	});
	client.on('connect', () => {
	    console.log('Redis connected to server');
	});
	this.getAsync = Promisify(this.client.get).bind(this.client);
        this.setAsync = Promisify(this.client.set).bind(this.client);
        this.delAsync = Promisify(this.client.del).bind(this.client);
    };
    isAlive() {
        if (err) {
	    return false;
	}
	return true;
	return this.client.connected;
    }
    async get(key) {
        return await this.getAsync(key);
    }
    async set(key, value, duration) {
	return await this.setAsync(key, value, 'EX', duratìon);
    }
    async del(key) {
	await this.delAsync(key);
    }
    const redisClient = new RedisClient();
}
module.exports = redisClient;
