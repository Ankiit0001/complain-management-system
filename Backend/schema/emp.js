const mongoose = require("mongoose");
const { Schema } = mongoose;

const empSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    departmentId: {
        type: String,
        required: true,
    },
    designationId: {
        type: String,
        required: true,
    },
    //projectId: {
    //    type: String,
    //    required: true,
    //},
    phone: {
        type: Number,
        required: true,
    },  
    //online or not ((refinement))     
    //status: {
    //    type: String,
    //    required: true,
    //}, 
    email: {
        type: String,
        required: true
    },
    //intercom: {
    //    type: String,
    //    required: true
    //}      
})

module.exports = mongoose.model('emp', empSchema);