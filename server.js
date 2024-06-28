const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const mongoSanatize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const error = require('./middleware/error');
const logger = require('./middleware/logger');

dotenv.config({path: './config/config.env'});

connectDB();

//Route files
const bootcamps = require('./routes/bootcamp.route');
const courses = require('./routes/courses.route');
const auth = require('./routes/auth.route');
const user = require('./routes/users.route');
const reviews = require('./routes/review.route');

const app = express();


// Body parser

app.use(express.json());

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// Sanitize data
app.use(mongoSanatize());


// Set security headers
app.use(helmet());

//Prevent XSS vulnerabilities
app.use(xss());

//Prevent Cross Site Request Forgery
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Prevent HTTP parameter pollution
app.use(hpp());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount Routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/user', user);
app.use('/api/v1/reviews', reviews);

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