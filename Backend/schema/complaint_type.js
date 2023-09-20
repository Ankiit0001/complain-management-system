const mongoose = require("mongoose");
const { Schema } = mongoose;

const complaintTypeSchema = Schema({
    complaintTypeID: {
        type: String,
        required: true,
        unique: true,
    },
    
    complaintTypeName: {
        type: String,
        required: true
    },

    departmentId: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model("complaint_type", complaintTypeSchema);