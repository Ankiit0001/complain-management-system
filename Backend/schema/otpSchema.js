const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: Date,
    expiredAt: Date,
})

module.exports = mongoose.model('otp', otpSchema);