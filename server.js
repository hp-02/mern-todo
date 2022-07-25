const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const viewpath = __dirname + '/views/';
app.use(express.static(viewpath));

// mongodb://localhost:27017/mern-todo
// `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.2a2mc.mongodb.net/mern-todo`
mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.2a2mc.mongodb.net/mern-todo`)
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));

const Todo = require("./models/todo.model");
const User = require("./models/user.model");

app.post("/register", async function (req, res, next) {
    const { email, password } = req.body;
    if (!validateEmail(email)) return res.status(400).send({ message: "Please check email address is valid." });
    if (!password || password.length < 8) return res.status(400).send({ message: "Please check password" });
    const cryptedPassword = crypto.createHash("sha256").update(password).digest("hex");
    User.create({ email: email, password: cryptedPassword }, function (err, docs) {
        if (err) return res.status(400).send({ message: "Email already present" });
        return res.json(req.body);
    });
});

app.post("/login", validateUser, async function (req, res, next) {
    return res.status(200).send({ message: "Correct login credentials" });
});

app.get("/todos", validateUser, async function (req, res, next) {
    const todos = await Todo.find({ userId: req.body.userId }, "-userId -__v");
    return res.json(todos);
});

app.post("/todos", validateUser, async function (req, res, next) {
    const todo = new Todo(req.body);
    todo.save().catch(err => res.status(400).send(err));
    delete todo.userId;
    return res.json(todo);
});

app.delete("/todos/:id", validateUser, async function (req, res, next) {
    Todo.findByIdAndDelete(req.params.id).select("-userId -__v")
        .then(result => res.json(result))
        .catch(err => res.status(400).send(err));
});

app.put("/todos/:id", validateUser, async function (req, res, next) {
    Todo.findByIdAndUpdate(req.params.id, { ...req.body }).select("-userId -__v")
        .then(todo => {
            res.json(todo);
        })
        .catch(err => res.status(400).send(err));
});

app.listen(8080, function () {
    console.log("Server started on port 8080");
});

async function validateUser(req, res, next) {
    try {
        const [email, password] = basicAuthCredentials(req);
        User.findOne({ email: email }, function (err, docs) {
            if (err || docs === null)
                return res.status(401).send({ message: "Unauthorized access" });
            if (docs.password !== crypto.createHash("sha256").update(password).digest("hex"))
                return res.status(401).send({ message: "Unauthorized access" });
            req.body.userId = docs._id.toString();
            next();
        });
    } catch (err) {
        return res.status(401).send({ message: "Unauthorized access" });
    }
}

function basicAuthCredentials(req) {
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    return credentials.split(':');
}

function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};
