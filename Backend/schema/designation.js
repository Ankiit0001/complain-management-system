const mongoose = require("mongoose");
const { Schema } = mongoose;

const designationSchema = Schema({
    designationId: {
        type: String,
        required: true,
        unique: true,
    },
    designationName: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model("designation", designationSchema);