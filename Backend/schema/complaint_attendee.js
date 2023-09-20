const mongoose = require("mongoose");
const { Schema } = mongoose;

const complaintSchema = Schema({
    complaint_no: {
        type: Number,
        required: true,
        unique: true,
    },
    attendee_empId: {
        type: String,
        required: true
    },
    attendee_remark: {
        type: String,
        required: true,
    },
    solved_at: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("complaint_attendee", complaintSchema);