const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- DB connection test ---');
console.log('URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');

if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB Atlas');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(err);
        process.exit(1);
    });
