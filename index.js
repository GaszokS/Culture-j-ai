// Import
const express = require("express");
const consolidate = require('consolidate');
const bodyParser = require('body-parser')
const crypto = require('crypto');
const secret = 'SECRETKEY';

const db = require('./db');

// App Config
const app = express();
app.use(
    bodyParser.urlencoded({ extended: true }),
    express.static('content')
);
app.engine('html', consolidate.hogan)
app.set('views', 'Content');
app.listen(3000);


// Routes
app.get("/", function (req, res) {
    res.render("index.html");
});

app.post("/", function (req, res) {
    var inputs = req.body.search;
    console.log(inputs);
    res.render("index.html");
});



app.get("/login", function (req, res) {
    res.render("login.html");
});

app.post("/login", async function (req, res) {
    const sha256Hasher = crypto.createHmac("sha256", secret);
    const hash = sha256Hasher.update(req.body.password).digest("hex");

    var userInfo = await db.getFromCollection("UserInfo", "users", { username: req.body.username });

    if (userInfo != null) {
        if (userInfo.password == hash) {
            console.log("Login Successful");
            res.render("login.html");
        } else {
            res.render("login.html", { error: "Wrong password" });
        }
    } else {
        res.render("login.html", { error: "User not found" });
    }
});

app.get("/register", function (req, res) {
    res.render("register.html");
});

app.post("/register", async function (req, res) {
    const sha256Hasher = crypto.createHmac("sha256", secret);
    const hash = sha256Hasher.update(req.body.password).digest("hex");

    var UserExist = await db.isInCollection("UserInfo", "users", { username: req.body.username });
    var mailExist = await db.isInCollection("UserInfo", "users", { email: req.body.email });

    if (UserExist) {
        res.render("register.html", { error: "Username have already been used" });
    } else if (mailExist) {
        res.render("register.html", { error: "Email have already been used" });
    } else {
        db.addToDB("UserInfo", "users", { username: req.body.username, password: hash, email: req.body.email, poidsEnHabricot : req.body.poidsEnHabricot });
        res.render("register.html");
    }
});
