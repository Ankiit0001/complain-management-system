const mongoose = require("mongoose");

const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.1"

const connectDB = async () => {
    try {
        mongoose.set({
            strictQuery: true
        });
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("connect to db");
    } catch(err) {
        console.error(err);
    }
};

module.exports = connectDB;
