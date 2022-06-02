// Import
const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const consolidate = require('consolidate');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const secret = 'SECRETKEY';

const db = require('./db');

// App Config
const app = express();
app.use(
    bodyParser.urlencoded({ extended: true })
);
app.engine('html', consolidate.hogan)
app.set('views', 'Content');

//session config
app.use(sessions({
    secret: secret,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}));

app.use(cookieParser());

//Usefull functions
function creatSession(userInfo, req, res) {
    delete userInfo.password;
    req.session.user = userInfo;
    console.log(req.session.user);
    res.redirect("/");
}

// Routes
app.get("/", function (req, res) {
    res.render("index.html", { user: req.session.user });
});

app.post("/", function (req, res) {
    var inputs = req.body.search;
    console.log(inputs);
    res.render("index.html", { user: req.session.user });
});



app.get("/login", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("login.html");
    }
});

app.post("/login", async function (req, res) {
    var userInfo = await db.getFromCollection("UserInfo", "users", { username: req.body.username });

    if (userInfo != null) {
        if (await bcrypt.compare(req.body.password, userInfo.password)) {
            console.log("Login Successful");
            creatSession(userInfo, req, res);
        } else {
            res.render("login.html", { error: "Wrong password" });
        }
    } else {
        res.render("login.html", { error: "User not found" });
    }
});

app.get("/register", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("register.html");
    }
});

app.post("/register", async function (req, res) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    var UserExist = await db.isInCollection("UserInfo", "users", { username: req.body.username });
    var mailExist = await db.isInCollection("UserInfo", "users", { email: req.body.email });

    if (UserExist) {
        res.render("register.html", { error: "Username have already been used" });
    } else if (mailExist) {
        res.render("register.html", { error: "Email have already been used" });
    } else {
        db.addToDB("UserInfo", "users", { username: req.body.username, password: hash, email: req.body.email, poidsEnHabricot: req.body.poidsEnHabricot });
        creatSession(await db.getFromCollection("UserInfo", "users", { username: req.body.username }), req, res);
    }
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.use(
    express.static('content')
);
app.listen(3000);