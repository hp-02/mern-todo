const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const viewpath = __dirname + '/views/';
app.use(express.static(viewpath));

// `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.2a2mc.mongodb.net/mern-todo`
mongoose.connect("mongodb://localhost:27017/mern-todo")
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));

const Todo = require("./models/todo.model");

app.get("/todos", checkUserId, async (req, res, next) => {
    const todos = await Todo.find({ userId: req.body.userId });
    return res.json(todos);
});

app.post("/todos", checkUserId, async (req, res, next) => {
    const todo = new Todo(req.body);
    todo.save().catch(err => res.status(400).send(err));
    return res.json(todo);
});

app.delete("/todos/:id", checkUserId, async (req, res, next) => {
    Todo.findByIdAndDelete(req.params.id)
        .then(result => res.json(result))
        .catch(err => res.status(400).send(err));
});

app.put("/todos/:id", checkUserId, async (req, res, next) => {
    Todo.findByIdAndUpdate(req.params.id, { ...req.body })
        .then(todo => {
            res.json(todo);
        })
        .catch(err => res.status(400).send(err));
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});

function checkUserId(req, res, next) {
    if (!req.headers.authorization) return res.status(400).send({ message: "Bad Request" });
    req.body.userId = req.headers.authorization;
    next();
}