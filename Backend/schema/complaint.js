const mongoose = require("mongoose");
const { Schema } = mongoose;

const complaintSchema = Schema({
    complaint_no: {
        type: Number,
        required: true,
        unique: true,
    },
    empId: {
        type: String,
        required: true
    },
    origin_departmentId: {
        type: String,
        required: true
    },
    complaint_departmentId: {
        type: String,
        required: true
    },
    complaint_location: {
        type: String,
        required: true,
    },
    complaint_type_id: {
        type: String,
        required: true,
    },
    complaint_description: {
        type: String,
        required: true,
    },
    //pdf,image,word
    complaint_proof: {
        type: Buffer,
    },
    complaint_status: {
        type: String,
        default:"N"
    },

    created_at: {
        type: Date,
        default: Date.now()
    },
})

module.exports = mongoose.model("complaints", complaintSchema);