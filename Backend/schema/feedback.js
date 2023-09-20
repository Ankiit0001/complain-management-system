const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = Schema({
    empId: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    description: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model("feedback", feedbackSchema);