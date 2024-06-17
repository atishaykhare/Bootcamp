const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config/config.env'});

const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(function (connection) {
    console.log(`Connected to Mongoose ${connection}`);
});

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const course = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const review = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));
// Import data to DB

const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(course);
        await User.create(user);

        console.log('Data Imported....');
        process.exit();
    } catch (e) {
        console.error({e})
        process.exit();

    }
}


const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed....');
        process.exit();
    } catch (e) {
        console.error({e})
        process.exit();

    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData()
}