const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Mongo Connected to ${conn.connection.host}`)
}

module.exports = connectDB;
