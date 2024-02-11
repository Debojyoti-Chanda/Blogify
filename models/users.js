const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Ensure username is unique
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
        // match: /^\S+@\S+\.\S+$/, // Basic email validation using regular expression
        lowercase: true // Convert email to lowercase
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum password length
    }
});

module.exports = mongoose.model('users', userSchema);