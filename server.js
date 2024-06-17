const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');

const error = require('./middleware/error');
const logger = require('./middleware/logger');

dotenv.config({path: './config/config.env'});

connectDB();

//Route files
const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/courses.route');
const auth = require('./routes/auth.route');

const app = express();


// Body parser

app.use(express.json());

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(fileUpload());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount Routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(error)

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode and listening on ${PORT}`,
    ));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
})