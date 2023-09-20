const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema= Schema({
    ProjectId: {
        type: String,
        required: true,
        unique: true,
    },
    ProjectDescription: {
        type: String,
        required: true,
    }

})

module.exports = mongoose.model("project", projectSchema);