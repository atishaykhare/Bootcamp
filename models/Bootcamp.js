const mongoose = require('mongoose');
const slugify = require('../utils/helper');

const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: 'string',
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxLength: [50, 'Name cant exceed 50 characters']
    },
    slug: String,
    description: {
        type: 'string',
        required: [true, 'Please add a description'],
        maxLength: [500, 'Description cant exceed 500 characters']
    },
    website: {
        type: 'string',
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: 'string',
        maxLength: [20, 'Please add a valid phone']
    },
    email: {
        type: 'string',
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: 'string',
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: Number,
        country: String,
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            "Web Development",
            "UI/UX",
            "Business",
            "Mobile Development",
            "Data Science",
            "Cybersecurity",
            "Machine Learning",
            "AI",
            "Cloud Computing",
            "Blockchain",
            "Game Development",
            "Data Analysis",
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must be at most 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg',
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: true
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

BootcampSchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
})


BootcampSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].country,
    }

    // Do not Save address in DB
    this.address = undefined;

    next();
})


// Cascade delete course when a bootcamp is deleted
BootcampSchema.pre('deleteOne', {document: true}, async function (next) {
    await mongoose.model('Course').deleteMany({bootcamp: this._id});
    next();
})

//Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false,
})


module.exports = mongoose.model('Bootcamp', BootcampSchema)