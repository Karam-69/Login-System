const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    id: { type: String, require: true, unique: true},
    username: { type: String, require: true},
    email: { type: String, require: true },
    password: { type: String, require: true },
    token: { type: String, require: true },
});

const model = mongoose.model("users", userSchema);

module.exports = model;
