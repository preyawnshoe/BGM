const mongoose = require('mongoose');

let cached = global._mongooseCache;
if (!cached) {
	cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
	if (cached.conn) return cached.conn;
	if (!cached.promise) {
		const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
		const masked = uri ? uri.replace(/(\/\/)([^:@]+):([^@]+)@/, '$1****:****@') : '(undefined)';
		console.log('[DB] Using Mongo URI:', masked);
		if (!uri) throw new Error('Missing MONGO_URI/MONGODB_URI');
		cached.promise = mongoose.connect(uri, {
			maxPoolSize: 5,
			serverSelectionTimeoutMS: 5000,
			directConnection: uri.includes('127.0.0.1') || uri.includes('localhost') ? true : undefined,
		}).then(m => m);
	}
	cached.conn = await cached.promise;
	return cached.conn;
}

module.exports = { connectToDatabase };


