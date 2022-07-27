const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    text: {
        type: String,
        default: ""
    },
    complete: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        default: Date.now()
    }
});

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;