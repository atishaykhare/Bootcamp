const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config/config.env'});

const Bootcamp = require('./models/Bootcamp');

mongoose.connect(process.env.MONGO_URI).then(function (connection) {
    console.log(`Connected to Mongoose ${connection}`);
});

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// Import data to DB

const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
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